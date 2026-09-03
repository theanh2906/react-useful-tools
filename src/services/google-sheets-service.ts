import { auth } from '@/config/firebase';
import type {
  SpreadsheetGrid,
  SpreadsheetSheet,
  SpreadsheetSource,
} from '@/types';
import {
  GoogleAuthProvider,
  linkWithPopup,
  reauthenticateWithPopup,
  signInWithPopup,
} from 'firebase/auth';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const EXCEL_HOSTS = ['1drv.ms', 'onedrive.live.com', 'sharepoint.com', 'office.com'];

interface ParsedSpreadsheetUrl {
  source: SpreadsheetSource;
  spreadsheetId?: string;
  title: string;
}

interface GoogleSpreadsheetResponse {
  spreadsheetId: string;
  properties: { title: string };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
      sheetType?: string;
      gridProperties?: { rowCount?: number; columnCount?: number };
    };
  }>;
}

interface GoogleValuesResponse {
  values?: Array<Array<string | number | boolean>>;
}

export class SpreadsheetServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'auth' | 'permission' | 'invalid-url' | 'network' | 'not-found' | 'office-file'
  ) {
    super(message);
    this.name = 'SpreadsheetServiceError';
  }
}

export function parseSpreadsheetUrl(rawUrl: string): ParsedSpreadsheetUrl {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new SpreadsheetServiceError('Link bảng tính không hợp lệ.', 'invalid-url');
  }

  if (url.hostname === 'docs.google.com') {
    const match = url.pathname.match(/\/spreadsheets(?:\/u\/\d+)?\/d\/([a-zA-Z0-9-_]+)/);
    if (!match?.[1]) {
      throw new SpreadsheetServiceError('Không tìm thấy mã Google Sheets trong link.', 'invalid-url');
    }
    return { source: 'google-sheets', spreadsheetId: match[1], title: 'Google Sheets' };
  }

  const isExcel =
    url.pathname.toLowerCase().endsWith('.xlsx') ||
    EXCEL_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  if (isExcel) {
    const fileName = decodeURIComponent(url.pathname.split('/').pop() || '');
    return { source: 'microsoft-excel', title: fileName || 'Microsoft Excel' };
  }

  throw new SpreadsheetServiceError(
    'Hiện chỉ hỗ trợ link Google Sheets và nhận diện link Microsoft Excel.',
    'invalid-url'
  );
}

export async function requestGoogleSheetsAccess(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.addScope(SHEETS_SCOPE);
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const currentUser = auth.currentUser;
    const result = !currentUser
      ? await signInWithPopup(auth, provider)
      : currentUser.providerData.some((item) => item.providerId === 'google.com')
        ? await reauthenticateWithPopup(currentUser, provider)
        : await linkWithPopup(currentUser, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new SpreadsheetServiceError('Google không trả về quyền truy cập Sheets.', 'auth');
    }
    return credential.accessToken;
  } catch (error) {
    if (error instanceof SpreadsheetServiceError) throw error;
    throw new SpreadsheetServiceError(
      'Không thể kết nối Google. Hãy cho phép quyền Google Sheets và thử lại.',
      'auth'
    );
  }
}

async function googleRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    const errorPayload = !response.ok
      ? await response.json().catch(() => null) as { error?: { message?: string } } | null
      : null;
    const providerMessage = errorPayload?.error?.message ?? '';
    if (response.status === 401) {
      throw new SpreadsheetServiceError('Phiên Google đã hết hạn. Vui lòng kết nối lại.', 'auth');
    }
    if (response.status === 400 && /Office file|must not be an Office/i.test(providerMessage)) {
      throw new SpreadsheetServiceError(
        'Đây là file Excel đang mở bằng Google Sheets, chưa phải Google Sheet native.',
        'office-file'
      );
    }
    if (response.status === 403) {
      const apiDisabled = providerMessage.includes('has not been used in project')
        || providerMessage.includes('is disabled');
      throw new SpreadsheetServiceError(
        apiDisabled
          ? 'Google Sheets API chưa được bật cho Firebase project này.'
          : 'Bạn chưa có quyền truy cập bảng tính này.',
        'permission'
      );
    }
    if (response.status === 404) {
      throw new SpreadsheetServiceError('Không tìm thấy bảng tính.', 'not-found');
    }
    if (!response.ok) {
      throw new SpreadsheetServiceError('Google Sheets đang không phản hồi. Hãy thử lại.', 'network');
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SpreadsheetServiceError) throw error;
    throw new SpreadsheetServiceError('Không thể kết nối tới Google Sheets.', 'network');
  }
}

export async function getSpreadsheetMetadata(spreadsheetId: string, token: string) {
  const fields = 'spreadsheetId,properties.title,sheets.properties';
  const result = await googleRequest<GoogleSpreadsheetResponse>(
    `${SHEETS_API}/${spreadsheetId}?includeGridData=false&fields=${encodeURIComponent(fields)}`,
    token
  );
  const sheets: SpreadsheetSheet[] = result.sheets
    .filter(({ properties }) => !properties.sheetType || properties.sheetType === 'GRID')
    .map(({ properties }) => ({
      id: properties.sheetId,
      title: properties.title,
      index: properties.index,
      rowCount: properties.gridProperties?.rowCount ?? 0,
      columnCount: properties.gridProperties?.columnCount ?? 0,
    }));
  return { title: result.properties.title, sheets };
}

function sheetRange(sheetTitle: string, range: string) {
  return `'${sheetTitle.replace(/'/g, "''")}'!${range}`;
}

export async function getSheetValues(
  spreadsheetId: string,
  sheetTitle: string,
  token: string
): Promise<SpreadsheetGrid> {
  const range = sheetRange(sheetTitle, 'A1:ZZ111');
  const result = await googleRequest<GoogleValuesResponse>(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
    token
  );
  const values = (result.values ?? []).map((row) => row.map((cell) => String(cell)));
  const headerIndex = values.slice(0, 10).reduce((bestIndex, row, index, candidates) => {
    const score = (candidate: string[]) => {
      const filled = candidate.filter((cell) => cell.trim()).length;
      const text = candidate.filter((cell) => cell.trim() && Number.isNaN(Number(cell))).length;
      return filled * 10 + text;
    };
    return score(row) > score(candidates[bestIndex] ?? []) ? index : bestIndex;
  }, 0);
  const rawHeaders = values[headerIndex] ?? [];
  const headers = rawHeaders.map((header, index) => header.trim() || `Cột ${index + 1}`);
  return {
    headers,
    rows: values.slice(headerIndex + 1, headerIndex + 101),
    truncated: values.length > headerIndex + 101,
  };
}

export async function appendSheetRow(
  spreadsheetId: string,
  sheetTitle: string,
  values: string[],
  token: string
) {
  const range = sheetRange(sheetTitle, 'A:ZZ');
  await googleRequest(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    token,
    { method: 'POST', body: JSON.stringify({ majorDimension: 'ROWS', values: [values] }) }
  );
}
