import { Button, Input, Modal, ModalFooter } from '@/components/ui';
import { Link2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface AddSpreadsheetModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
}

export function AddSpreadsheetModal({ isOpen, isLoading, onClose, onSubmit }: AddSpreadsheetModalProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!isOpen) setUrl('');
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;
    await onSubmit(url.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm bảng tính"
      description="Dán link Google Sheets. Link Excel sẽ được lưu ở chế độ fallback nếu chưa hỗ trợ."
      closeOnOverlayClick={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Link bảng tính"
          type="url"
          inputMode="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          leftIcon={<Link2 className="size-4" />}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          disabled={isLoading}
          autoFocus
        />
        <div className="rounded-md border border-accent-100 bg-accent-50 px-4 py-3 text-sm text-accent-800">
          Useful Tools chỉ xin quyền đọc và cập nhật những bảng tính tài khoản Google của bạn được phép truy cập.
        </div>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button type="submit" isLoading={isLoading} disabled={!url.trim()}>Kết nối</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
