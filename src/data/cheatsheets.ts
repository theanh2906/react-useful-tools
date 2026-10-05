import ghPart1 from './cheatsheets/gh-01.json';
import ghPart2 from './cheatsheets/gh-02.json';
import ghPart3 from './cheatsheets/gh-03.json';
import ghPart4 from './cheatsheets/gh-04.json';
import ghPart5 from './cheatsheets/gh-05.json';
import ghPart6 from './cheatsheets/gh-06.json';
import twgPart1 from './cheatsheets/twg-01.json';
import twgPart2 from './cheatsheets/twg-02.json';
import twgPart3 from './cheatsheets/twg-03.json';
import twgPart4 from './cheatsheets/twg-04.json';
import twgPart5 from './cheatsheets/twg-05.json';
import twgPart6 from './cheatsheets/twg-06.json';
import twgPart7 from './cheatsheets/twg-07.json';
import twgPart8 from './cheatsheets/twg-08.json';
import twgPart9 from './cheatsheets/twg-09.json';
import twgPart10 from './cheatsheets/twg-10.json';
import twgPart11 from './cheatsheets/twg-11.json';
import twgPart12 from './cheatsheets/twg-12.json';
import twgPart13 from './cheatsheets/twg-13.json';
import twgPart14 from './cheatsheets/twg-14.json';
import twgPart15 from './cheatsheets/twg-15.json';
import twgPart16 from './cheatsheets/twg-16.json';
import twgPart17 from './cheatsheets/twg-17.json';
import twgPart18 from './cheatsheets/twg-18.json';
import twgPart19 from './cheatsheets/twg-19.json';
import twgPart20 from './cheatsheets/twg-20.json';
import twgPart21 from './cheatsheets/twg-21.json';
import twgPart22 from './cheatsheets/twg-22.json';
import twgPart23 from './cheatsheets/twg-23.json';
import twgPart24 from './cheatsheets/twg-24.json';
import twgPart25 from './cheatsheets/twg-25.json';
import twgPart26 from './cheatsheets/twg-26.json';
import twgPart27 from './cheatsheets/twg-27.json';
import twgPart28 from './cheatsheets/twg-28.json';
import twgPart29 from './cheatsheets/twg-29.json';
import twgPart30 from './cheatsheets/twg-30.json';
import twgPart31 from './cheatsheets/twg-31.json';
import gitPart1 from './cheatsheets/git-01.json';
import gitPart2 from './cheatsheets/git-02.json';
import gitPart3 from './cheatsheets/git-03.json';
import gitPart4 from './cheatsheets/git-04.json';
import gitPart5 from './cheatsheets/git-05.json';
import gitPart6 from './cheatsheets/git-06.json';
import gitPart7 from './cheatsheets/git-07.json';
import gitPart8 from './cheatsheets/git-08.json';
import gitPart9 from './cheatsheets/git-09.json';

/** Static, source-checked Vietnamese CLI reference. This module never executes commands. */
export type CheatsheetToolId = 'gh' | 'twg' | 'git';
export type CheatsheetRisk = 'read' | 'write' | 'destructive';

export interface CheatsheetSource {
  title: string;
  url: string;
}

export interface CheatsheetCommand {
  id: string;
  title: string;
  command: string;
  description: string;
  example: string;
  risk: CheatsheetRisk;
  warning?: string;
  billingNote?: string;
  tags: string[];
  sourceUrl: string;
  canonicalCommand?: string;
  options?: { flag: string; description: string; example?: string }[];
  status?: 'preview' | 'deprecated';
  exampleKind?: 'usage' | 'template' | 'discovery';
}

export interface CheatsheetGroup {
  id: string;
  title: string;
  commands: CheatsheetCommand[];
  level?: 'core' | 'advanced' | 'plumbing';
}

export interface Cheatsheet {
  id: CheatsheetToolId;
  title: string;
  description: string;
  versionNote: string;
  verifiedAt: string;
  billingNote?: string;
  coverage?: {
    scope: string;
    inventoryVersion: string;
    referenceUrl: string;
    totalCommands: number;
    coveredCommands: number;
    exclusions?: string[];
  };
  sources: CheatsheetSource[];
  groups: CheatsheetGroup[];
}

/** Join bounded static JSON parts without mutating the imported reference data. */
function mergeGroups(parts: CheatsheetGroup[][]): CheatsheetGroup[] {
  const groups: CheatsheetGroup[] = [];
  const byId = new Map<string, CheatsheetGroup>();
  for (const part of parts) {
    for (const group of part) {
      const previous = byId.get(group.id);
      if (previous) previous.commands.push(...group.commands);
      else {
        const copy = { ...group, commands: [...group.commands] };
        groups.push(copy);
        byId.set(group.id, copy);
      }
    }
  }
  return groups;
}

export const cheatsheets: Cheatsheet[] = [
  {
    id: 'gh',
    title: 'GitHub CLI',
    description:
      'Toàn bộ 205 mục tra cứu gh công khai: mọi lệnh thực thi trong Manual, các chủ đề trợ giúp và --version; có ví dụ, cờ quan trọng, mức rủi ro và nguồn từng lệnh.',
    versionNote:
      'Đối chiếu Manual trực tuyến ngày 04/10/2026 và release v2.102.0 ngày 30/09/2026. Chạy gh --version và gh help reference để kiểm tra bản trên máy; tính năng preview có thể đổi. Dùng gh từ 2.102.0 để có các bản vá tải file và xác minh attestation được ghi trong release. Ví dụ dùng shell kiểu POSIX; dấu <...>, [...], {...} trong dòng cú pháp là ký hiệu tham chiếu, không chép nguyên như lệnh chạy. Thay chữ HOA, ID, tên repository/nhánh và đường dẫn mẫu bằng dữ liệu đã kiểm tra. octo-org/cli-sandbox là ví dụ. Mức rủi ro theo ví dụ; cờ khác có thể ghi/xóa hoặc mở rộng quyền. Trang chỉ tra cứu và sao chép, không thực thi lệnh.',
    verifiedAt: '2026-10-04',
    billingNote:
      'Lệnh kích hoạt Actions, Copilot/agent hoặc Codespaces có thể tiêu tốn hạn mức/chi phí theo gói. Lệnh đọc vẫn có thể dùng API rate limit.',
    coverage: {
      scope:
        'Tất cả lệnh công khai có hành vi riêng trong GitHub CLI Manual; bao gồm nested commands, help topics, preview và --version.',
      inventoryVersion:
        'GitHub CLI Manual trực tuyến 2026-10-04; bản phát hành chính thức đã đối chiếu v2.102.0 (2026-09-30), commit fc4b137cdef0a6bd28fd461b7cf9c84a5812a8cd',
      referenceUrl: 'https://cli.github.com/manual/gh_help_reference',
      totalCommands: 205,
      coveredCommands: 205,
      exclusions: [
        'Các trang chỉ làm mục lục nhóm lệnh không được tính thành lệnh riêng; gh codespace ports và gh help có hành vi riêng nên vẫn được bao phủ.',
        'Alias chính thức được ánh xạ về lệnh chuẩn, không nhân đôi số lượng; alias do người dùng tự tạo và lệnh tùy ý của extension bên thứ ba nằm ngoài inventory đóng.',
        'Các lệnh ẩn/nội bộ không được công bố trong Manual (actions, accessibility/a11y, credits, repo credits, send-telemetry, version) không nằm trong phạm vi public manual; gh --version công khai được cung cấp riêng.',
        'Cú pháp riêng của Copilot CLI và nội dung skill/extension bên ngoài không phải command leaf của gh; có gh copilot và toàn bộ lệnh quản lý skill/extension.',
      ],
    },
    sources: [
      {
        title: 'GitHub CLI Manual: toàn bộ tham chiếu',
        url: 'https://cli.github.com/manual/gh_help_reference',
      },
      {
        title: 'GitHub CLI Manual: mục lục',
        url: 'https://cli.github.com/manual/',
      },
      {
        title: 'GitHub CLI v2.102.0: release và bản vá bảo mật',
        url: 'https://github.com/cli/cli/releases/tag/v2.102.0',
      },
      {
        title: 'Mã nguồn đăng ký lệnh gh tại v2.102.0',
        url: 'https://github.com/cli/cli/blob/v2.102.0/pkg/cmd/root/root.go',
      },
    ],
    groups: mergeGroups([
      ghPart1,
      ghPart2,
      ghPart3,
      ghPart4,
      ghPart5,
      ghPart6,
    ] as CheatsheetGroup[][]),
  },
  {
    id: 'twg',
    title: 'Teamwork Graph CLI',
    description:
      'Toàn bộ 691 đường dẫn trong danh mục công khai, với cú pháp và tùy chọn đối chiếu từ bản stable chính thức. Các ví dụ cần schema động được đánh dấu rõ.',
    versionNote:
      'Pin stable 1.3.3, build 32ee314125ea; SHA-256 đã đối chiếu. Danh mục public snapshot 56b9b3472458 (02/10/2026), kiểm tra 04/10/2026. Phân tích tĩnh, không chạy CLI. twg api chỉ thuộc stable 1.3.3; beta 1.3.5 đã loại lệnh này.',
    verifiedAt: '2026-10-04',
    billingNote:
      'Các lệnh Enriched và một số tùy chọn mở rộng cần Rovo Credits; đọc nhãn ở từng lệnh.',
    sources: [
      {
        title: 'Atlassian: public command catalog',
        url: 'https://atlassian.github.io/twg-cli/commands/commands-catalog/',
      },
      {
        title: 'Atlassian: stable release manifest',
        url: 'https://teamwork-graph.atlassian.com/cli/manifest.json',
      },
      {
        title: 'Atlassian: checksums for 1.3.3',
        url: 'https://teamwork-graph.atlassian.com/cli/SHA256SUMS-v1.3.3',
      },
      {
        title: 'Atlassian: release changelog',
        url: 'https://atlassian.github.io/twg-cli/changelog/',
      },
      {
        title: 'Atlassian: exact source artifact 1.3.3',
        url: 'https://teamwork-graph.atlassian.com/cli/twg-linux-x64-v1.3.3',
      },
    ],
    coverage: {
      scope:
        '691 đường dẫn công khai, gồm 5 bí danh được chỉ rõ; 10 mục cần payload theo schema runtime và được đánh dấu mẫu cần điền.',
      inventoryVersion: 'stable 1.3.3 / catalog 56b9b3472458',
      referenceUrl:
        'https://atlassian.github.io/twg-cli/commands/commands-catalog/',
      totalCommands: 691,
      coveredCommands: 691,
      exclusions: [
        'Không đưa cờ ẩn/nội bộ và --pr không hoạt động vào danh sách tùy chọn.',
        'Payload runtime chưa xác minh cho 10 mục có schema động; các mục này có mẫu lệnh thật với biến JSON cần điền và cách tra hợp đồng.',
      ],
    },
    groups: mergeGroups([
      twgPart1,
      twgPart2,
      twgPart3,
      twgPart4,
      twgPart5,
      twgPart6,
      twgPart7,
      twgPart8,
      twgPart9,
      twgPart10,
      twgPart11,
      twgPart12,
      twgPart13,
      twgPart14,
      twgPart15,
      twgPart16,
      twgPart17,
      twgPart18,
      twgPart19,
      twgPart20,
      twgPart21,
      twgPart22,
      twgPart23,
      twgPart24,
      twgPart25,
      twgPart26,
      twgPart27,
      twgPart28,
      twgPart29,
      twgPart30,
      twgPart31,
    ] as CheatsheetGroup[][]),
  },
  {
    id: 'git',
    title: 'Git',
    description:
      'Tra cứu đầy đủ danh mục lệnh chính thức Git: từ commit hằng ngày đến plumbing, quản trị và công cụ tích hợp. Giải thích tiếng Việt, ví dụ, tùy chọn quan trọng và cảnh báo theo thao tác.',
    versionNote:
      'Chốt theo mã nguồn và tài liệu Git 2.56.0 (28/09/2026), đối chiếu ngày 04/10/2026. Kiểm tra git version trên máy: lệnh experimental/mới có thể chưa tồn tại ở bản cũ, GUI/interop có thể cần gói phụ. Các chữ HOA hoặc <...> là giá trị thay thế; URL example.*, tên branch/file và đường dẫn là dữ liệu mẫu, cần kho thử nghiệm phù hợp. Ví dụ shell dùng cú pháp POSIX. Nhãn rủi ro áp dụng cho ví dụ được hiển thị, tùy chọn khác có thể nguy hiểm hơn. “Ghi” bao gồm object, metadata, file local hoặc dịch vụ nền. Trang chỉ tra cứu/sao chép, không thực thi lệnh.',
    verifiedAt: '2026-10-04',
    sources: [
      {
        title: 'Git 2.56.0 — danh mục lệnh chính thức cố định',
        url: 'https://github.com/git/git/blob/v2.56.0/command-list.txt',
      },
      {
        title: 'Git — manual và phân loại porcelain/plumbing',
        url: 'https://git-scm.com/docs/git',
      },
      {
        title: 'Git 2.56.0 — nguồn tài liệu cho từng lệnh',
        url: 'https://github.com/git/git/tree/v2.56.0/Documentation',
      },
      {
        title: 'Git — quy ước cú pháp command line',
        url: 'https://git-scm.com/docs/gitcli',
      },
      {
        title: 'Git — cách viết revision và range',
        url: 'https://git-scm.com/docs/gitrevisions',
      },
    ],
    coverage: {
      scope:
        'Đủ 161 mục lệnh trong command-list.txt của Git 2.56.0, trình gọi git và 9 helper/alias có manual(1) bổ sung trong Documentation (171 tên chuẩn), gồm porcelain, plumbing, helpers, gitk, gitweb và Scalar. Mỗi mục có ví dụ; các họ nhiều chế độ có thêm công thức. Không tuyên bố liệt kê mọi tổ hợp cờ/đối số hoặc extension bên ngoài.',
      inventoryVersion: 'Git 2.56.0 · 2026-09-28',
      referenceUrl: 'https://github.com/git/git/blob/v2.56.0/command-list.txt',
      totalCommands: 171,
      coveredCommands: 171,
      exclusions: [
        '35 trang không phải lệnh được kê riêng: 33 trang guide/userinterfaces/developerinterfaces trong inventory và 2 bài viết/danh mục trong Documentation.',
        'Alias cá nhân, extension bên thứ ba và executable helper nội bộ không có mục trong inventory công khai hoặc manual(1) không nằm trong phạm vi; ví dụ git-lfs, git-flow và git-filter-repo.',
        'gitweb được giữ như mục chính thức nhưng là CGI frontend, khởi chạy bằng git instaweb theo manual; git-sh-i18n/git-sh-setup là thư viện shell được source, không phải lệnh thao tác repository độc lập.',
      ],
    },
    groups: mergeGroups([
      gitPart1,
      gitPart2,
      gitPart3,
      gitPart4,
      gitPart5,
      gitPart6,
      gitPart7,
      gitPart8,
      gitPart9,
    ] as CheatsheetGroup[][]),
  },
];
