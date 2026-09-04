'use client';

import { AddSpreadsheetModal } from '@/components/spreadsheet/add-spreadsheet-modal';
import { RecordEditorSheet } from '@/components/spreadsheet/record-editor-sheet';
import { SpreadsheetFileCard } from '@/components/spreadsheet/spreadsheet-file-card';
import { Button, Card } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { generateId } from '@/lib/utils';
import {
  appendSheetRow,
  clearGoogleSheetsAccess,
  getCachedGoogleSheetsAccess,
  getSheetValues,
  getSpreadsheetMetadata,
  parseSpreadsheetUrl,
  requestGoogleSheetsAccess,
  SpreadsheetServiceError,
} from '@/services/google-sheets-service';
import { useSpreadsheetStore } from '@/stores/spreadsheet-store';
import type { SpreadsheetConnection, SpreadsheetGrid } from '@/types';
import { motion } from 'framer-motion';
import { FilePlus2, LockKeyhole, Plus, TableProperties } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

function gridKey(fileId: string, sheetId?: number) {
  return `${fileId}:${sheetId ?? 'none'}`;
}

export default function SpreadsheetManager() {
  const { files, selectedId, addFile, updateFile, removeFile, selectFile } = useSpreadsheetStore();
  const [googleToken, setGoogleToken] = useState<string | null>(() => getCachedGoogleSheetsAccess());
  const [grids, setGrids] = useState<Record<string, SpreadsheetGrid>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecordSheet, setShowRecordSheet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const autoLoadedKeys = useRef(new Set<string>());

  const selectedFile = files.find((file) => file.id === selectedId) ?? null;
  const selectedSheet = selectedFile?.sheets.find((sheet) => sheet.id === selectedFile.selectedSheetId)
    ?? selectedFile?.sheets[0];
  const selectedGrid = selectedFile ? grids[gridKey(selectedFile.id, selectedSheet?.id)] ?? null : null;

  const loadGrid = useCallback(async (file: SpreadsheetConnection, token: string, sheetId?: number) => {
    const sheet = file.sheets.find((item) => item.id === sheetId) ?? file.sheets[0];
    if (!file.externalId || !sheet) return;
    setLoadingId(file.id);
    try {
      const grid = await getSheetValues(file.externalId, sheet.title, token);
      setGrids((current) => ({ ...current, [gridKey(file.id, sheet.id)]: grid }));
      updateFile(file.id, { selectedSheetId: sheet.id, lastSyncedAt: Date.now(), status: 'connected' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải bảng tính.';
      if (error instanceof SpreadsheetServiceError && error.code === 'auth') {
        clearGoogleSheetsAccess();
        setGoogleToken(null);
      }
      updateFile(file.id, { status: 'error', statusMessage: message });
      toast.error('Không thể đồng bộ', message);
    } finally {
      setLoadingId(null);
    }
  }, [updateFile]);

  const connectAndLoad = async (file: SpreadsheetConnection) => {
    setLoadingId(file.id);
    try {
      const token = await requestGoogleSheetsAccess();
      setGoogleToken(token);
      const metadata = await getSpreadsheetMetadata(file.externalId!, token);
      const updated = { ...file, title: metadata.title, sheets: metadata.sheets };
      updateFile(file.id, { title: metadata.title, sheets: metadata.sheets, status: 'connected', statusMessage: undefined });
      await loadGrid(updated, token, file.selectedSheetId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể kết nối Google.';
      if (error instanceof SpreadsheetServiceError && error.code === 'auth') {
        clearGoogleSheetsAccess();
        setGoogleToken(null);
      }
      if (error instanceof SpreadsheetServiceError && error.code === 'office-file') {
        updateFile(file.id, {
          source: 'microsoft-excel',
          status: 'unsupported',
          statusMessage: message,
          sheets: [],
          selectedSheetId: undefined,
        });
        selectFile(null);
        toast.info('Đã nhận diện file Excel', 'File mở được trên Google Drive nhưng chưa hỗ trợ cập nhật trực tiếp.');
        setLoadingId(null);
        return;
      }
      updateFile(file.id, {
        status: error instanceof SpreadsheetServiceError && error.code === 'auth' ? 'needs-auth' : 'error',
        statusMessage: message,
      });
      toast.error('Kết nối thất bại', message);
      setLoadingId(null);
    }
  };

  const handleAddFile = async (url: string) => {
    setIsAddingFile(true);
    try {
      const parsed = parseSpreadsheetUrl(url);
      if (parsed.source === 'microsoft-excel') {
        addFile({
          id: generateId(), source: parsed.source, url, title: parsed.title,
          status: 'unsupported', statusMessage: 'Link này chưa hỗ trợ cập nhật.', sheets: [], createdAt: Date.now(),
        });
        selectFile(null);
        setShowAddModal(false);
        toast.info('Đã lưu link Excel', 'Hiện file này ở chế độ fallback và chưa thể cập nhật.');
        return;
      }

      const token = await requestGoogleSheetsAccess();
      let metadata;
      try {
        metadata = await getSpreadsheetMetadata(parsed.spreadsheetId!, token);
      } catch (error) {
        if (error instanceof SpreadsheetServiceError && error.code === 'office-file') {
          addFile({
            id: generateId(), source: 'microsoft-excel', url, externalId: parsed.spreadsheetId,
            title: 'File Excel trên Google Drive', status: 'unsupported', statusMessage: error.message,
            sheets: [], createdAt: Date.now(),
          });
          selectFile(null);
          setShowAddModal(false);
          toast.info('Đã nhận diện file Excel', 'File mở được trên Google Drive nhưng chưa hỗ trợ cập nhật trực tiếp.');
          return;
        }
        throw error;
      }
      const file: SpreadsheetConnection = {
        id: generateId(), source: parsed.source, url, externalId: parsed.spreadsheetId,
        title: metadata.title, status: 'connected', sheets: metadata.sheets,
        selectedSheetId: metadata.sheets[0]?.id, lastSyncedAt: Date.now(), createdAt: Date.now(),
      };
      setGoogleToken(token);
      addFile(file);
      setShowAddModal(false);
      toast.success('Đã kết nối Google Sheets');
      await loadGrid(file, token);
    } catch (error) {
      if (error instanceof SpreadsheetServiceError && error.code === 'auth') {
        clearGoogleSheetsAccess();
        setGoogleToken(null);
      }
      toast.error('Không thể thêm bảng tính', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setIsAddingFile(false);
    }
  };

  const handleSelect = async (file: SpreadsheetConnection) => {
    if (selectedId === file.id) {
      selectFile(null);
      return;
    }
    selectFile(file.id);
    if (googleToken && !grids[gridKey(file.id, file.selectedSheetId)]) await loadGrid(file, googleToken);
  };

  const handleSelectSheet = async (file: SpreadsheetConnection, sheetId: number) => {
    updateFile(file.id, { selectedSheetId: sheetId });
    if (googleToken && !grids[gridKey(file.id, sheetId)]) await loadGrid(file, googleToken, sheetId);
  };

  const handleSaveRecord = async (values: string[]) => {
    if (!selectedFile?.externalId || !selectedSheet || !googleToken) return;
    setIsSaving(true);
    try {
      const appendedValues = await appendSheetRow(
        selectedFile.externalId,
        selectedSheet.title,
        values,
        googleToken
      );
      const key = gridKey(selectedFile.id, selectedSheet.id);
      setGrids((current) => {
        const grid = current[key];
        if (!grid) return current;
        return {
          ...current,
          [key]: { ...grid, rows: [...grid.rows, appendedValues] },
        };
      });
      updateFile(selectedFile.id, {
        lastSyncedAt: Date.now(),
        status: 'connected',
        statusMessage: undefined,
      });
      setShowRecordSheet(false);
      toast.success('Đã thêm bản ghi vào Google Sheets');
    } catch (error) {
      if (error instanceof SpreadsheetServiceError && error.code === 'auth') {
        clearGoogleSheetsAccess();
        setGoogleToken(null);
      }
      toast.error('Không thể lưu bản ghi', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!googleToken || !selectedFile || !selectedSheet || selectedGrid) return;
    const key = gridKey(selectedFile.id, selectedSheet.id);
    if (autoLoadedKeys.current.has(key)) return;
    autoLoadedKeys.current.add(key);
    void loadGrid(selectedFile, googleToken, selectedSheet.id);
  }, [googleToken, loadGrid, selectedFile, selectedGrid, selectedSheet]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Bảng tính của tôi</h1>
          <p className="mt-1 hidden text-muted sm:block">Cập nhật Google Sheets nhanh mà không cần mở file gốc.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} leftIcon={<Plus className="size-5" />} className="shrink-0">
          <span className="hidden sm:inline">Thêm bảng tính</span><span className="sm:hidden">Thêm</span>
        </Button>
      </div>

      {files.length > 0 ? <div className="space-y-4">{files.map((file) => (
        <SpreadsheetFileCard
          key={file.id}
          file={file}
          data={grids[gridKey(file.id, file.selectedSheetId)] ?? null}
          isSelected={selectedId === file.id}
          isLoading={loadingId === file.id}
          hasGoogleAccess={Boolean(googleToken)}
          onSelect={() => void handleSelect(file)}
          onSelectSheet={(sheetId) => void handleSelectSheet(file, sheetId)}
          onRefresh={() => googleToken ? void loadGrid(file, googleToken, file.selectedSheetId) : void connectAndLoad(file)}
          onConnect={() => void connectAndLoad(file)}
          onAddRecord={() => setShowRecordSheet(true)}
          onRemove={() => removeFile(file.id)}
        />
      ))}</div> : (
        <Card className="px-5 py-14 text-center sm:px-8">
          <span className="mx-auto flex size-16 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <TableProperties className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-foreground">Kết nối bảng tính đầu tiên</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">Dán link Google Sheets để xem từng trang tính và thêm bản ghi ngay trong Useful Tools.</p>
          <Button onClick={() => setShowAddModal(true)} leftIcon={<FilePlus2 className="size-4" />} className="mt-6">Thêm bảng tính</Button>
        </Card>
      )}

      <div className="flex items-start gap-3 px-1 text-xs text-muted">
        <LockKeyhole className="mt-0.5 size-4 shrink-0 text-accent-500" />
        <p>Danh sách link lưu trên trình duyệt này. Quyền Google được giữ an toàn trong tab hiện tại tối đa 50 phút.</p>
      </div>

      <AddSpreadsheetModal isOpen={showAddModal} isLoading={isAddingFile} onClose={() => setShowAddModal(false)} onSubmit={handleAddFile} />
      <RecordEditorSheet isOpen={showRecordSheet} headers={selectedGrid?.headers ?? []} isSaving={isSaving} onClose={() => setShowRecordSheet(false)} onSave={handleSaveRecord} />
    </motion.div>
  );
}
