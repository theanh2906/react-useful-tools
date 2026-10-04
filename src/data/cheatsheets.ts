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
}

export interface CheatsheetGroup {
  id: string;
  title: string;
  commands: CheatsheetCommand[];
}

export interface Cheatsheet {
  id: CheatsheetToolId;
  title: string;
  description: string;
  versionNote: string;
  verifiedAt: string;
  billingNote?: string;
  sources: CheatsheetSource[];
  groups: CheatsheetGroup[];
}

export const cheatsheets: Cheatsheet[] = [
  {
    id: 'gh',
    title: 'GitHub CLI',
    description:
      'Làm việc với repository, issue, pull request và GitHub Actions ngay trong terminal.',
    versionNote:
      'Đối chiếu GitHub CLI Manual ngày 04/10/2026; không khẳng định phiên bản gh đã cài. Các chữ HOA là giá trị cần thay. octo-org/cli-sandbox, số issue/PR/run và nhánh trong ví dụ là dữ liệu minh họa: thay bằng repository thử nghiệm bạn có quyền dùng. Nhãn ghi bao gồm thay đổi trên máy hoặc GitHub; cảnh báo chỉ rõ phạm vi. Chỉ tra cứu và sao chép, trang không thực thi lệnh.',
    verifiedAt: '2026-10-04',
    sources: [
      {
        title: 'GitHub CLI Manual',
        url: 'https://cli.github.com/manual/',
      },
      {
        title: 'GitHub CLI: Pull requests',
        url: 'https://cli.github.com/manual/gh_pr',
      },
      {
        title: 'GitHub CLI: Workflow runs',
        url: 'https://cli.github.com/manual/gh_run',
      },
      {
        title: 'GitHub CLI: API',
        url: 'https://cli.github.com/manual/gh_api',
      },
    ],
    groups: [
      {
        id: 'auth',
        title: 'Tài khoản & đăng nhập',
        commands: [
          {
            id: 'gh-auth-status',
            title: 'Kiểm tra đăng nhập',
            command: 'gh auth status --hostname HOST',
            description:
              'Kiểm tra tài khoản đang hoạt động và tình trạng xác thực trên một GitHub host.',
            example: 'gh auth status --hostname github.com',
            risk: 'read',
            warning:
              'Không thêm --show-token khi chia sẻ đầu ra vì cờ đó làm lộ token.',
            tags: ['auth', 'account', 'status'],
            sourceUrl: 'https://cli.github.com/manual/gh_auth_status',
          },
          {
            id: 'gh-auth-login',
            title: 'Đăng nhập qua trình duyệt',
            command: 'gh auth login --hostname HOST --git-protocol https --web',
            description:
              'Bắt đầu luồng đăng nhập GitHub qua trình duyệt và dùng HTTPS cho Git.',
            example:
              'gh auth login --hostname github.com --git-protocol https --web',
            risk: 'write',
            warning:
              'Tạo phiên xác thực và lưu thông tin đăng nhập trên máy. Nếu kho thông tin xác thực không khả dụng, gh có thể lưu token dạng văn bản; kiểm tra nơi lưu bằng gh auth status. Tự xem quyền được yêu cầu trước khi chấp thuận.',
            tags: ['auth', 'login', 'local-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_auth_login',
          },
        ],
      },
      {
        id: 'repositories',
        title: 'Khám phá repository',
        commands: [
          {
            id: 'gh-repo-view',
            title: 'Xem repository',
            command: 'gh repo view OWNER/REPO',
            description: 'Đọc mô tả và README của repository trong terminal.',
            example: 'gh repo view cli/cli',
            risk: 'read',
            tags: ['repo', 'readme', 'inspect'],
            sourceUrl: 'https://cli.github.com/manual/gh_repo_view',
          },
          {
            id: 'gh-repo-list',
            title: 'Liệt kê repository',
            command: 'gh repo list OWNER --limit 20 --no-archived',
            description:
              'Xem tối đa 20 repository của một tài khoản hoặc tổ chức, bỏ qua repository đã lưu trữ.',
            example: 'gh repo list cli --limit 20 --no-archived',
            risk: 'read',
            tags: ['repo', 'list', 'organization'],
            sourceUrl: 'https://cli.github.com/manual/gh_repo_list',
          },
          {
            id: 'gh-repo-clone',
            title: 'Clone về máy',
            command: 'gh repo clone OWNER/REPO DIRECTORY',
            description: 'Tải repository về một thư mục làm việc trên máy.',
            example: 'gh repo clone cli/cli gh-cli-study',
            risk: 'write',
            warning:
              'Ghi file trên máy; chọn thư mục đích mới. Chỉ đọc mã sau khi clone, không tự chạy mã hoặc script chưa được kiểm tra.',
            tags: ['repo', 'clone', 'local-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_repo_clone',
          },
        ],
      },
      {
        id: 'issues',
        title: 'Theo dõi issue',
        commands: [
          {
            id: 'gh-issue-list',
            title: 'Liệt kê issue mở',
            command: 'gh issue list --repo OWNER/REPO --state open --limit 20',
            description:
              'Xem danh sách issue đang mở trong repository đã chọn.',
            example: 'gh issue list --repo cli/cli --state open --limit 20',
            risk: 'read',
            tags: ['issue', 'list', 'triage'],
            sourceUrl: 'https://cli.github.com/manual/gh_issue_list',
          },
          {
            id: 'gh-issue-view',
            title: 'Đọc issue và bình luận',
            command: 'gh issue view ISSUE_NUMBER --repo OWNER/REPO --comments',
            description:
              'Đọc thông tin issue cùng các bình luận để có đủ ngữ cảnh.',
            example: 'gh issue view 42 --repo octo-org/cli-sandbox --comments',
            risk: 'read',
            tags: ['issue', 'view', 'comments'],
            sourceUrl: 'https://cli.github.com/manual/gh_issue_view',
          },
          {
            id: 'gh-issue-create',
            title: 'Tạo issue',
            command:
              'gh issue create --repo OWNER/REPO --title "TITLE" --body "BODY"',
            description: 'Tạo issue mới với tiêu đề và nội dung được chỉ định.',
            example:
              'gh issue create --repo octo-org/cli-sandbox --title "Bổ sung ví dụ README" --body "Thêm một ví dụ sử dụng trong repository thử nghiệm."',
            risk: 'write',
            warning:
              'Ghi lên GitHub và có thể gửi thông báo. Kiểm tra repository, tiêu đề và nội dung trước khi chạy; không đưa bí mật vào issue.',
            tags: ['issue', 'create', 'remote-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_issue_create',
          },
          {
            id: 'gh-issue-comment',
            title: 'Bình luận issue',
            command:
              'gh issue comment ISSUE_NUMBER --repo OWNER/REPO --body "COMMENT"',
            description: 'Gửi một bình luận vào issue cụ thể.',
            example:
              'gh issue comment 42 --repo octo-org/cli-sandbox --body "Ví dụ minh họa cho môi trường thử nghiệm."',
            risk: 'write',
            warning:
              'Đăng nội dung lên GitHub ngay khi chạy và có thể thông báo cho người theo dõi. Xác nhận đúng issue và nội dung.',
            tags: ['issue', 'comment', 'remote-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_issue_comment',
          },
          {
            id: 'gh-issue-close',
            title: 'Đóng issue đã xong',
            command:
              'gh issue close ISSUE_NUMBER --repo OWNER/REPO --reason completed',
            description:
              'Đổi trạng thái issue sang đóng với lý do đã hoàn thành.',
            example:
              'gh issue close 42 --repo octo-org/cli-sandbox --reason completed',
            risk: 'write',
            warning:
              'Thay đổi trạng thái trên GitHub. Chỉ đóng khi đã xác nhận công việc hoàn thành và đúng issue.',
            tags: ['issue', 'close', 'remote-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_issue_close',
          },
        ],
      },
      {
        id: 'pull-requests',
        title: 'Review & merge PR',
        commands: [
          {
            id: 'gh-pr-list',
            title: 'Liệt kê PR mở',
            command: 'gh pr list --repo OWNER/REPO --state open --limit 20',
            description: 'Xem tối đa 20 pull request đang mở.',
            example: 'gh pr list --repo cli/cli --state open --limit 20',
            risk: 'read',
            tags: ['pr', 'list', 'review'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_list',
          },
          {
            id: 'gh-pr-status',
            title: 'Tổng quan PR liên quan',
            command: 'gh pr status --repo OWNER/REPO --conflict-status',
            description:
              'Tóm tắt PR liên quan đến bạn cùng trạng thái review, kiểm tra và xung đột merge.',
            example:
              'gh pr status --repo octo-org/cli-sandbox --conflict-status',
            risk: 'read',
            tags: ['pr', 'status', 'conflicts'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_status',
          },
          {
            id: 'gh-pr-view',
            title: 'Đọc PR và thảo luận',
            command: 'gh pr view PR_NUMBER --repo OWNER/REPO --comments',
            description: 'Đọc tiêu đề, mô tả và bình luận của pull request.',
            example: 'gh pr view 17 --repo octo-org/cli-sandbox --comments',
            risk: 'read',
            tags: ['pr', 'view', 'comments'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_view',
          },
          {
            id: 'gh-pr-diff',
            title: 'Xem phần thay đổi',
            command: 'gh pr diff PR_NUMBER --repo OWNER/REPO --color never',
            description: 'Hiển thị diff của PR không kèm mã màu terminal.',
            example: 'gh pr diff 17 --repo octo-org/cli-sandbox --color never',
            risk: 'read',
            tags: ['pr', 'diff', 'review'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_diff',
          },
          {
            id: 'gh-pr-checks',
            title: 'Chờ kiểm tra bắt buộc',
            command:
              'gh pr checks PR_NUMBER --repo OWNER/REPO --required --watch --interval 10',
            description:
              'Theo dõi các kiểm tra bắt buộc của PR cho đến khi chúng kết thúc.',
            example:
              'gh pr checks 17 --repo octo-org/cli-sandbox --required --watch --interval 10',
            risk: 'read',
            warning:
              'Chỉ hiện các kiểm tra bắt buộc, không phải toàn bộ CI. Lệnh giữ terminal trong khi theo dõi; Ctrl+C dừng xem, không hủy CI.',
            tags: ['pr', 'checks', 'ci', 'watch'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_checks',
          },
          {
            id: 'gh-pr-checkout',
            title: 'Checkout để review',
            command:
              'gh pr checkout PR_NUMBER --repo OWNER/REPO --branch LOCAL_BRANCH',
            description:
              'Từ bản clone của repository, tải và chuyển sang nhánh PR để kiểm tra trên máy.',
            example:
              'gh pr checkout 17 --repo octo-org/cli-sandbox --branch review-pr-17',
            risk: 'write',
            warning:
              'Thay đổi nhánh và file làm việc trên máy. Kiểm tra git status, lưu công việc hiện tại và chọn tên nhánh mới. Không tự chạy mã PR chưa tin cậy; không thêm --force.',
            tags: ['pr', 'checkout', 'local-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_checkout',
          },
          {
            id: 'gh-pr-create',
            title: 'Tạo PR nháp',
            command:
              'gh pr create --repo OWNER/REPO --base BASE_BRANCH --head HEAD_BRANCH --draft --title "TITLE" --body "BODY"',
            description:
              'Tạo pull request dạng nháp từ nhánh đã push, chỉ rõ nhánh nguồn và nhánh đích.',
            example:
              'gh pr create --repo octo-org/cli-sandbox --base main --head docs/example --draft --title "Thêm ví dụ README" --body "PR nháp cho repository thử nghiệm."',
            risk: 'write',
            warning:
              'Tạo PR thật trên GitHub dù ở trạng thái nháp. Kiểm tra nhánh, commit và nội dung trước khi chạy. --dry-run cũng có thể push thay đổi Git; không xem nó là bảo đảm chỉ đọc.',
            tags: ['pr', 'create', 'draft', 'remote-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_create',
          },
          {
            id: 'gh-pr-review',
            title: 'Gửi nhận xét review',
            command:
              'gh pr review PR_NUMBER --repo OWNER/REPO --comment --body "REVIEW"',
            description:
              'Gửi một review dạng nhận xét, chưa phê duyệt hoặc yêu cầu thay đổi.',
            example:
              'gh pr review 17 --repo octo-org/cli-sandbox --comment --body "Có thể bổ sung ví dụ đầu vào rỗng trong phần tài liệu."',
            risk: 'write',
            warning:
              'Đăng review lên GitHub. Kiểm tra PR và nội dung; --approve hoặc --request-changes thay đổi ý nghĩa review và chỉ dùng sau khi đánh giá đầy đủ.',
            tags: ['pr', 'review', 'remote-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_review',
          },
          {
            id: 'gh-pr-merge',
            title: 'Merge PR bằng squash',
            command: 'gh pr merge PR_NUMBER --repo OWNER/REPO --squash',
            description:
              'Gộp các commit của PR thành một commit trên nhánh đích khi các quy định của repository cho phép.',
            example: 'gh pr merge 17 --repo octo-org/cli-sandbox --squash',
            risk: 'write',
            warning:
              'Thay đổi nhánh đích trên GitHub và có thể kích hoạt triển khai. Chỉ chạy sau khi review diff, CI và nhánh đích. Repository dùng merge queue có thể đưa PR vào hàng chờ hoặc bật auto-merge. Không dùng --admin để bỏ qua quy định.',
            tags: ['pr', 'merge', 'squash', 'remote-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_merge',
          },
        ],
      },
      {
        id: 'actions',
        title: 'GitHub Actions & CI',
        commands: [
          {
            id: 'gh-run-list',
            title: 'Liệt kê lần chạy CI',
            command: 'gh run list --repo OWNER/REPO --limit 20',
            description:
              'Xem những lần chạy workflow gần đây và lấy run ID để xem chi tiết.',
            example: 'gh run list --repo cli/cli --limit 20',
            risk: 'read',
            tags: ['actions', 'ci', 'runs'],
            sourceUrl: 'https://cli.github.com/manual/gh_run_list',
          },
          {
            id: 'gh-run-view',
            title: 'Đọc log bước lỗi',
            command: 'gh run view RUN_ID --repo OWNER/REPO --log-failed',
            description:
              'Hiển thị log của các bước thất bại trong một lần chạy workflow.',
            example:
              'gh run view 123456789 --repo octo-org/cli-sandbox --log-failed',
            risk: 'read',
            warning:
              'Log có thể chứa dữ liệu nội bộ. Kiểm tra và che thông tin nhạy cảm trước khi chia sẻ.',
            tags: ['actions', 'logs', 'debug'],
            sourceUrl: 'https://cli.github.com/manual/gh_run_view',
          },
          {
            id: 'gh-run-watch',
            title: 'Theo dõi CI đến cuối',
            command:
              'gh run watch RUN_ID --repo OWNER/REPO --exit-status --interval 10',
            description:
              'Chờ một lần chạy kết thúc; trả mã thoát khác 0 nếu lần chạy thất bại.',
            example:
              'gh run watch 123456789 --repo octo-org/cli-sandbox --exit-status --interval 10',
            risk: 'read',
            warning:
              'Theo tài liệu đã kiểm tra, lệnh chưa hỗ trợ xác thực bằng fine-grained PAT. Ctrl+C chỉ dừng theo dõi trên máy.',
            tags: ['actions', 'watch', 'ci'],
            sourceUrl: 'https://cli.github.com/manual/gh_run_watch',
          },
          {
            id: 'gh-run-rerun',
            title: 'Chạy lại job lỗi',
            command: 'gh run rerun RUN_ID --repo OWNER/REPO --failed',
            description:
              'Yêu cầu chạy lại các job thất bại, bao gồm các job mà chúng phụ thuộc.',
            example:
              'gh run rerun 123456789 --repo octo-org/cli-sandbox --failed',
            risk: 'write',
            warning:
              'Khởi chạy công việc trên GitHub, tiêu tốn tài nguyên CI và có thể lặp lại thao tác triển khai hoặc tác dụng phụ. Kiểm tra workflow và run ID trước khi chạy.',
            tags: ['actions', 'rerun', 'remote-write'],
            sourceUrl: 'https://cli.github.com/manual/gh_run_rerun',
          },
          {
            id: 'gh-workflow-list',
            title: 'Liệt kê workflow',
            command: 'gh workflow list --repo OWNER/REPO --all',
            description:
              'Xem các workflow, bao gồm cả workflow đang bị vô hiệu hóa.',
            example: 'gh workflow list --repo cli/cli --all',
            risk: 'read',
            tags: ['actions', 'workflow', 'list'],
            sourceUrl: 'https://cli.github.com/manual/gh_workflow_list',
          },
          {
            id: 'gh-workflow-view',
            title: 'Đọc YAML workflow',
            command:
              'gh workflow view WORKFLOW_FILE --repo OWNER/REPO --yaml --ref BRANCH',
            description:
              'Đọc định nghĩa YAML của workflow trên nhánh hoặc tag chỉ định.',
            example:
              'gh workflow view ci.yml --repo octo-org/cli-sandbox --yaml --ref main',
            risk: 'read',
            tags: ['actions', 'workflow', 'yaml'],
            sourceUrl: 'https://cli.github.com/manual/gh_workflow_view',
          },
        ],
      },
      {
        id: 'releases',
        title: 'Tra cứu bản phát hành',
        commands: [
          {
            id: 'gh-release-list',
            title: 'Liệt kê bản ổn định',
            command:
              'gh release list --repo OWNER/REPO --exclude-drafts --exclude-pre-releases --limit 10',
            description:
              'Xem tối đa 10 bản phát hành, loại bản nháp và bản phát hành thử.',
            example:
              'gh release list --repo cli/cli --exclude-drafts --exclude-pre-releases --limit 10',
            risk: 'read',
            tags: ['release', 'versions', 'list'],
            sourceUrl: 'https://cli.github.com/manual/gh_release_list',
          },
          {
            id: 'gh-release-view',
            title: 'Đọc release mới nhất',
            command: 'gh release view --repo OWNER/REPO',
            description:
              'Xem thông tin và ghi chú của release được GitHub xác định là mới nhất.',
            example: 'gh release view --repo cli/cli',
            risk: 'read',
            tags: ['release', 'changelog', 'view'],
            sourceUrl: 'https://cli.github.com/manual/gh_release_view',
          },
        ],
      },
      {
        id: 'structured-output',
        title: 'JSON & API chỉ đọc',
        commands: [
          {
            id: 'gh-pr-list-json',
            title: 'Trích URL của PR',
            command:
              "gh pr list --repo OWNER/REPO --state open --json number,title,url --jq '.[].url'",
            description:
              'Chọn các trường JSON của PR rồi dùng bộ lọc jq tích hợp để in mỗi URL trên một dòng.',
            example:
              "gh pr list --repo cli/cli --state open --json number,title,url --jq '.[].url'",
            risk: 'read',
            tags: ['pr', 'json', 'jq', 'automation'],
            sourceUrl: 'https://cli.github.com/manual/gh_pr_list',
          },
          {
            id: 'gh-repo-view-json',
            title: 'Lấy metadata repository',
            command:
              'gh repo view OWNER/REPO --json nameWithOwner,defaultBranchRef,url',
            description:
              'Xuất tên đầy đủ, nhánh mặc định và URL repository dưới dạng JSON.',
            example:
              'gh repo view cli/cli --json nameWithOwner,defaultBranchRef,url',
            risk: 'read',
            tags: ['repo', 'json', 'metadata'],
            sourceUrl: 'https://cli.github.com/manual/gh_repo_view',
          },
          {
            id: 'gh-api-get',
            title: 'Gọi REST API để đọc',
            command:
              "gh api --method GET repos/OWNER/REPO --jq '{name: .full_name, stars: .stargazers_count, url: .html_url}'",
            description:
              'Gửi GET đến REST API GitHub và trích thông tin công khai về repository.',
            example:
              "gh api --method GET repos/cli/cli --jq '{name: .full_name, stars: .stargazers_count, url: .html_url}'",
            risk: 'read',
            warning:
              'Giữ --method GET cho ví dụ chỉ đọc. Khi thêm --field hoặc --raw-field mà không chỉ định method, gh api tự chuyển sang POST; các endpoint hoặc method khác có thể ghi dữ liệu.',
            tags: ['api', 'rest', 'json', 'jq'],
            sourceUrl: 'https://cli.github.com/manual/gh_api',
          },
        ],
      },
    ],
  },
  {
    id: 'twg',
    title: 'Teamwork Graph CLI',
    description:
      'Tra cứu Jira, Confluence và ngữ cảnh Atlassian từ terminal, kèm cách khám phá cú pháp đúng với bản cài.',
    versionNote:
      'Đối chiếu tài liệu chính thức ngày 04/10/2026. Manifest stable: 1.3.3 (32ee314125ea); bản beta 1.3.5 không phải stable. Một số hướng dẫn cũ dùng update; tài liệu hiện tại dùng upgrade. Cú pháp thực tế theo twg help describe của bản cài.',
    verifiedAt: '2026-10-04',
    billingNote:
      'Các mục Enriched cần Rovo Credits. Quyền tài khoản và cấu hình tổ chức quyết định dữ liệu có thể truy cập.',
    sources: [
      {
        title: 'Atlassian TWG CLI: command catalog',
        url: 'https://atlassian.github.io/twg-cli/commands/commands-catalog/',
      },
      {
        title: 'Atlassian TWG CLI: stable manifest',
        url: 'https://teamwork-graph.atlassian.com/cli/manifest.json',
      },
      {
        title: 'Atlassian TWG CLI: installation',
        url: 'https://atlassian.github.io/twg-cli/getting-started/installation/',
      },
      {
        title: 'Atlassian TWG CLI: changelog',
        url: 'https://atlassian.github.io/twg-cli/changelog/',
      },
      {
        title: 'Atlassian TWG CLI: public reference skills',
        url: 'https://github.com/atlassian/twg-cli/tree/main/skills',
      },
    ],
    groups: [
      {
        id: 'setup',
        title: 'Kiểm tra & thiết lập',
        commands: [
          {
            id: 'twg-doctor',
            title: 'Chẩn đoán kết nối',
            command: 'twg doctor',
            description:
              'Kiểm tra đăng nhập, kết nối và bản dựng khi CLI gặp lỗi.',
            example: 'twg doctor',
            risk: 'read',
            tags: ['health', 'auth', 'diagnostics'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/getting-started/troubleshooting/',
          },
          {
            id: 'twg-whoami',
            title: 'Tài khoản đang dùng',
            command: 'twg whoami',
            description: 'Xem danh tính Atlassian đang được CLI sử dụng.',
            example: 'twg whoami',
            risk: 'read',
            tags: ['auth', 'account'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/commands/commands-catalog/',
          },
          {
            id: 'twg-access',
            title: 'Kiểm tra phạm vi truy cập',
            command: 'twg access',
            description:
              'Liệt kê sản phẩm và site có hoạt động tài khoản đã được xác nhận.',
            example: 'twg access',
            risk: 'read',
            tags: ['permissions', 'site', 'org'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/commands/commands-catalog/',
          },
          {
            id: 'twg-login',
            title: 'Đăng nhập Atlassian',
            command: 'twg login',
            description: 'Mở luồng OAuth để kết nối tài khoản với TWG.',
            example: 'twg login',
            risk: 'write',
            tags: ['auth', 'oauth'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/getting-started/how-authentication-works/',
            warning:
              'Đọc kỹ quyền OAuth trước khi chấp thuận; CLI lưu thông tin đăng nhập trên máy. Không dán token vào chat.',
          },
          {
            id: 'twg-setup',
            title: 'Thiết lập hoặc sửa cấu hình',
            command: 'twg setup',
            description:
              'Chạy lại quy trình cấu hình và làm mới bộ hướng dẫn cho agent.',
            example: 'twg setup',
            risk: 'write',
            tags: ['setup', 'config', 'skills'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/getting-started/troubleshooting/',
            warning:
              'Có thể mở đăng nhập, thay đổi cấu hình, làm mới skills và bật tác vụ bảo trì nền. Chỉ chạy khi muốn thiết lập hoặc sửa cấu hình.',
          },
        ],
      },
      {
        id: 'discovery',
        title: 'Khám phá lệnh',
        commands: [
          {
            id: 'twg-help',
            title: 'Đọc trợ giúp tổng quan',
            command: 'twg --help',
            description: 'Xem các nhóm lệnh mà bản cài hiện tại hỗ trợ.',
            example: 'twg --help',
            risk: 'read',
            tags: ['help', 'commands'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/getting-started/installation/',
          },
          {
            id: 'twg-help-search',
            title: 'Tìm lệnh theo tác vụ',
            command: 'twg help <từ khóa...>',
            description:
              'Tìm cú pháp liên quan trước khi chọn một lệnh cụ thể.',
            example: 'twg help jira workitem',
            risk: 'read',
            tags: ['help', 'search', 'discovery'],
            sourceUrl: 'https://atlassian.github.io/twg-cli/agents/skills/',
          },
          {
            id: 'twg-help-describe',
            title: 'Kiểm tra đối số chính xác',
            command: 'twg help describe "<đường dẫn lệnh>"',
            description: 'Xem hợp đồng lệnh, đối số và giá trị được hỗ trợ.',
            example: 'twg help describe "jira workitem get"',
            risk: 'read',
            tags: ['help', 'schema', 'flags'],
            sourceUrl: 'https://atlassian.github.io/twg-cli/agents/skills/',
          },
          {
            id: 'twg-discover-skills',
            title: 'Tìm hướng dẫn cho agent',
            command: 'twg help discover-skills "<tác vụ>"',
            description: 'Tìm tài liệu hướng dẫn phù hợp với một công việc.',
            example:
              'twg help discover-skills "JQL sprint prioritization" --skill twg-jira',
            risk: 'read',
            tags: ['help', 'skills', 'agent'],
            sourceUrl: 'https://atlassian.github.io/twg-cli/agents/skills/',
          },
          {
            id: 'twg-capabilities',
            title: 'Xem khả năng của bản cài',
            command: 'twg capabilities',
            description:
              'Kiểm tra thông tin bản dựng và khả năng hỗ trợ ngoại tuyến.',
            example: 'twg capabilities',
            risk: 'read',
            tags: ['version', 'build', 'offline'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/commands/commands-catalog/',
          },
        ],
      },
      {
        id: 'jira',
        title: 'Jira',
        commands: [
          {
            id: 'twg-jira-get',
            title: 'Đọc một work item',
            command: 'twg jira workitem get <KEY>',
            description: 'Lấy trạng thái và các trường của ticket đã biết mã.',
            example: 'twg jira workitem get DEMO-123',
            risk: 'read',
            tags: ['jira', 'issue', 'read'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/references/workitems.md',
            warning:
              'DEMO-123 là mã minh họa; thay bằng ticket bạn có quyền truy cập.',
          },
          {
            id: 'twg-jira-full',
            title: 'Đọc đầy đủ ngữ cảnh ticket',
            command: 'twg jira workitem get <KEY> --full',
            description:
              'Lấy toàn bộ trường, bình luận và liên kết ngoài của ticket.',
            example: 'twg jira workitem get DEMO-123 --full',
            risk: 'read',
            tags: ['jira', 'comments', 'links'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/references/workitems.md',
            warning:
              'Có thể tải nhiều dữ liệu. --full đã bao gồm comments và remote links, không cần thêm hai cờ này.',
          },
          {
            id: 'twg-jira-search',
            title: 'Tìm ticket theo nội dung',
            command: 'twg jira workitem search "<từ khóa>" --limit <n>',
            description: 'Tìm văn bản trong Jira khi chưa biết mã ticket.',
            example: 'twg jira workitem search "login failure" --limit 20',
            risk: 'read',
            tags: ['jira', 'search', 'text'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/references/querying.md',
            warning: 'Giới hạn 20 có thể không bao quát mọi kết quả.',
          },
          {
            id: 'twg-jira-query',
            title: 'Lọc việc đang được giao',
            command: 'twg jira workitem query --jql "<JQL>"',
            description:
              'Dùng JQL để chọn chính xác ticket theo người phụ trách và trạng thái.',
            example:
              'twg jira workitem query --jql "assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC"',
            risk: 'read',
            tags: ['jira', 'jql', 'assigned', 'workflow'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/references/querying.md',
          },
          {
            id: 'twg-jira-transitions',
            title: 'Xem trạng thái có thể chuyển',
            command:
              'twg jira workitem transition --id <KEY> --site <SITE> -o json',
            description:
              'Liệt kê transition và các trường bắt buộc trước khi đổi trạng thái.',
            example:
              'twg jira workitem transition --id DEMO-123 --site example.atlassian.net -o json',
            risk: 'read',
            tags: ['jira', 'transition', 'json'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/SKILL.md',
            warning:
              'Ví dụ này chỉ đọc vì không có --transition-id. Thêm --transition-id sẽ thay đổi trạng thái ticket; thay mã và site minh họa trước khi dùng.',
          },
          {
            id: 'twg-jira-context',
            title: 'Tìm quan hệ của ticket',
            command: 'twg context jira workitem <KEY>',
            description:
              'Tìm tài liệu, con người và công việc liên quan qua Teamwork Graph.',
            example: 'twg context jira workitem DEMO-123',
            risk: 'read',
            tags: ['jira', 'graph', 'context'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/SKILL.md',
            billingNote:
              'Lệnh Enriched: cần Rovo Credits; kiểm tra quyền và hạn mức của tổ chức trước khi chạy.',
          },
        ],
      },
      {
        id: 'confluence',
        title: 'Confluence',
        commands: [
          {
            id: 'twg-confluence-get',
            title: 'Đọc trang Confluence',
            command: 'twg confluence content get <ID-or-URL>',
            description:
              'Đọc nội dung đã biết ID hoặc URL bằng lệnh Confluence gốc.',
            example: 'twg confluence content get 123456',
            risk: 'read',
            tags: ['confluence', 'page', 'read'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-confluence/references/content.md',
            warning:
              '123456 là ID minh họa; thay bằng ID hoặc URL trang bạn có quyền đọc.',
          },
          {
            id: 'twg-confluence-query',
            title: 'Tìm trang bằng CQL',
            command: 'twg confluence search query --cql "<CQL>"',
            description: 'Lọc trang theo space và sắp xếp theo lần cập nhật.',
            example:
              'twg confluence search query --cql \'space = "DEMO" AND type = page ORDER BY lastmodified DESC\'',
            risk: 'read',
            tags: ['confluence', 'cql', 'search'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-confluence/SKILL.md',
            warning:
              'Thay DEMO bằng space key của bạn; kết quả tìm kiếm cần được đọc lại trước khi tóm tắt nội dung.',
          },
          {
            id: 'twg-confluence-versions',
            title: 'Xem lịch sử phiên bản',
            command: 'twg confluence content versions list --id <ID>',
            description: 'Liệt kê các phiên bản của một trang.',
            example: 'twg confluence content versions list --id 123456',
            risk: 'read',
            tags: ['confluence', 'versions', 'history'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg-confluence/SKILL.md',
          },
          {
            id: 'twg-confluence-personal-space',
            title: 'Tìm space cá nhân',
            command: 'twg confluence space me',
            description:
              'Xác định space Confluence cá nhân của tài khoản hiện tại.',
            example: 'twg confluence space me',
            risk: 'read',
            tags: ['confluence', 'space', 'me'],
            sourceUrl: 'https://atlassian.github.io/twg-cli/changelog/',
          },
        ],
      },
      {
        id: 'graph-search',
        title: 'Đồ thị & tìm kiếm',
        commands: [
          {
            id: 'twg-rovo-apps',
            title: 'Xem nguồn tìm kiếm',
            command: 'twg rovo list-apps -o json',
            description:
              'Kiểm tra các ứng dụng có thể tìm kiếm và trạng thái kết nối.',
            example: 'twg rovo list-apps -o json',
            risk: 'read',
            tags: ['rovo', 'apps', 'json'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg/SKILL.md',
          },
          {
            id: 'twg-rovo-search',
            title: 'Tìm xuyên ứng dụng',
            command: 'twg rovo search "<chủ đề>" --limit <n>',
            description: 'Dùng Rovo để tìm ngữ cảnh trên các nguồn đã kết nối.',
            example: 'twg rovo search "release checklist" --limit 10',
            risk: 'read',
            tags: ['rovo', 'search', 'cross-app'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg/SKILL.md',
            warning:
              'Exit code 3 nghĩa là kết quả chưa đầy đủ; giữ phần đã nhận và kiểm tra cảnh báo quyền truy cập.',
            billingNote:
              'Lệnh Enriched: cần Rovo Credits; kiểm tra quyền và hạn mức của tổ chức trước khi chạy.',
          },
          {
            id: 'twg-docs-search',
            title: 'Tìm tài liệu theo chủ đề',
            command: 'twg docs search "<chủ đề>"',
            description:
              'Tìm tài liệu khi chỉ biết chủ đề hoặc một phần tiêu đề.',
            example: 'twg docs search "onboarding"',
            risk: 'read',
            tags: ['docs', 'search', 'knowledge'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg/SKILL.md',
            billingNote:
              'Lệnh Enriched: cần Rovo Credits; kiểm tra quyền và hạn mức của tổ chức trước khi chạy.',
          },
          {
            id: 'twg-docs-query',
            title: 'Xem hoạt động tài liệu',
            command: 'twg docs query --since <khoảng thời gian>',
            description:
              'Xem tài liệu liên quan đến hoạt động gần đây của người dùng.',
            example: 'twg docs query --since 7d',
            risk: 'read',
            tags: ['docs', 'activity', 'recent'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg/SKILL.md',
            warning:
              'Đây là truy vấn hoạt động theo thời gian; dùng docs search để tìm theo nội dung.',
            billingNote:
              'Lệnh Enriched: cần Rovo Credits; kiểm tra quyền và hạn mức của tổ chức trước khi chạy.',
          },
          {
            id: 'twg-work-query',
            title: 'Tổng hợp công việc cá nhân',
            command: 'twg work query --scope me',
            description:
              'Xem công việc do bạn tạo trong khoảng mặc định bảy ngày.',
            example: 'twg work query --scope me',
            risk: 'read',
            tags: ['work', 'me', 'activity'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg/SKILL.md',
            warning:
              'Kết quả hoạt động không đồng nghĩa với mọi việc chưa hoàn thành; dùng Jira JQL để xem ticket đang được giao.',
            billingNote:
              'Lệnh Enriched: cần Rovo Credits; kiểm tra quyền và hạn mức của tổ chức trước khi chạy.',
          },
          {
            id: 'twg-work-search',
            title: 'Tìm công việc theo chủ đề',
            command: 'twg work search "<chủ đề>"',
            description:
              'Tìm các loại công việc bằng từ khóa trong phạm vi tổ chức.',
            example: 'twg work search "release readiness"',
            risk: 'read',
            tags: ['work', 'search', 'context'],
            sourceUrl:
              'https://github.com/atlassian/twg-cli/blob/main/skills/twg/SKILL.md',
            billingNote:
              'Lệnh Enriched: cần Rovo Credits; kiểm tra quyền và hạn mức của tổ chức trước khi chạy.',
          },
        ],
      },
      {
        id: 'people',
        title: 'Con người',
        commands: [
          {
            id: 'twg-people-describe',
            title: 'Tra cứu hồ sơ đồng nghiệp',
            command: 'twg people describe --name "<tên>"',
            description:
              'Tìm hồ sơ theo tên; kiểm tra danh tính nếu có người trùng tên.',
            example: 'twg people describe --name "Nguyen An"',
            risk: 'read',
            tags: ['people', 'profile', 'identity'],
            sourceUrl: 'https://atlassian.github.io/twg-cli/changelog/',
            warning:
              'Tên chỉ là ví dụ. --manager và --direct-reports là tùy chọn Enriched có thể cần Rovo Credits.',
          },
        ],
      },
      {
        id: 'maintenance',
        title: 'Bảo trì',
        commands: [
          {
            id: 'twg-upgrade-check',
            title: 'Kiểm tra bản cập nhật',
            command: 'twg upgrade --check',
            description: 'Kiểm tra phiên bản hiện có trên kênh đang theo dõi.',
            example: 'twg upgrade --check',
            risk: 'read',
            tags: ['version', 'upgrade', 'check'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/getting-started/installation/',
            warning:
              'Tài liệu mới dùng upgrade; nếu bản cài khác cú pháp, đối chiếu twg --help trước khi dùng.',
          },
          {
            id: 'twg-upgrade',
            title: 'Nâng cấp CLI',
            command: 'twg upgrade',
            description:
              'Cài bản phát hành mới và làm mới các skills được phát hiện.',
            example: 'twg upgrade',
            risk: 'write',
            tags: ['upgrade', 'maintenance'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/getting-started/installation/',
            warning:
              'Thay đổi binary và có thể ghi đè skills đã cài. Kiểm tra trước bằng twg upgrade --check; bản do trình quản lý gói quản lý có thể cần quy trình riêng.',
          },
          {
            id: 'twg-uninstall',
            title: 'Xem trước việc gỡ cài đặt',
            command: 'twg uninstall --dry-run',
            description: 'Liệt kê những tệp và cấu hình sẽ bị gỡ mà chưa xóa.',
            example: 'twg uninstall --dry-run',
            risk: 'read',
            tags: ['uninstall', 'dry-run', 'preview'],
            sourceUrl:
              'https://atlassian.github.io/twg-cli/getting-started/installation/',
            warning:
              'Giữ --dry-run để chỉ xem trước. Chạy twg uninstall không có cờ này sẽ gỡ CLI, xóa cấu hình và thu hồi thông tin xác thực sau xác nhận.',
          },
        ],
      },
    ],
  },
  {
    id: 'git',
    title: 'Git',
    description:
      '30 lệnh cho vòng lặp làm việc với Git: kiểm tra, commit, nhánh, đồng bộ, stash và hoàn tác. Thay các giá trị trong <...> trước khi chạy; ví dụ giả định tên tệp và nhánh tương ứng đã tồn tại khi cần.',
    versionNote:
      'Dùng cú pháp Git hiện đại, gồm switch, restore và init --initial-branch. Kiểm tra git --version và git <lệnh> --help nếu máy chưa hỗ trợ một tùy chọn. Các ví dụ giả định cấu hình Git thông thường.',
    verifiedAt: '2026-10-04',
    sources: [
      {
        title: 'git-init',
        url: 'https://git-scm.com/docs/git-init',
      },
      {
        title: 'git-clone',
        url: 'https://git-scm.com/docs/git-clone',
      },
      {
        title: 'git-status',
        url: 'https://git-scm.com/docs/git-status',
      },
      {
        title: 'git-diff',
        url: 'https://git-scm.com/docs/git-diff',
      },
      {
        title: 'git-log',
        url: 'https://git-scm.com/docs/git-log',
      },
      {
        title: 'git-show',
        url: 'https://git-scm.com/docs/git-show',
      },
      {
        title: 'git-add',
        url: 'https://git-scm.com/docs/git-add',
      },
      {
        title: 'git-restore',
        url: 'https://git-scm.com/docs/git-restore',
      },
      {
        title: 'git-commit',
        url: 'https://git-scm.com/docs/git-commit',
      },
      {
        title: 'git-branch',
        url: 'https://git-scm.com/docs/git-branch',
      },
      {
        title: 'git-switch',
        url: 'https://git-scm.com/docs/git-switch',
      },
      {
        title: 'git-merge',
        url: 'https://git-scm.com/docs/git-merge',
      },
      {
        title: 'git-remote',
        url: 'https://git-scm.com/docs/git-remote',
      },
      {
        title: 'git-fetch',
        url: 'https://git-scm.com/docs/git-fetch',
      },
      {
        title: 'git-pull',
        url: 'https://git-scm.com/docs/git-pull',
      },
      {
        title: 'git-push',
        url: 'https://git-scm.com/docs/git-push',
      },
      {
        title: 'git-stash',
        url: 'https://git-scm.com/docs/git-stash',
      },
      {
        title: 'git-reflog',
        url: 'https://git-scm.com/docs/git-reflog',
      },
      {
        title: 'git-revert',
        url: 'https://git-scm.com/docs/git-revert',
      },
      {
        title: 'git-reset',
        url: 'https://git-scm.com/docs/git-reset',
      },
    ],
    groups: [
      {
        id: 'start',
        title: 'Bắt đầu',
        commands: [
          {
            id: 'git-init',
            title: 'Tạo kho mới',
            command: 'git init --initial-branch=main <directory>',
            description:
              'Khởi tạo kho Git với nhánh đầu tiên tên main trong thư mục chỉ định.',
            example: 'git init --initial-branch=main demo-project',
            risk: 'write',
            tags: ['init', 'repository', 'local'],
            sourceUrl: 'https://git-scm.com/docs/git-init',
          },
          {
            id: 'git-clone',
            title: 'Sao chép kho',
            command: 'git clone <repository> <directory>',
            description:
              'Tạo bản sao từ URL hoặc kho local vào thư mục mới; ví dụ dùng kho local ../project.',
            example: 'git clone ../project project-copy',
            risk: 'write',
            tags: ['clone', 'repository', 'download'],
            sourceUrl: 'https://git-scm.com/docs/git-clone',
          },
        ],
      },
      {
        id: 'inspect',
        title: 'Kiểm tra thay đổi',
        commands: [
          {
            id: 'git-status',
            title: 'Xem trạng thái gọn',
            command: 'git status --short --branch',
            description:
              'Xem nhánh hiện tại và tệp thay đổi. Hai cột trạng thái lần lượt là index và working tree.',
            example: 'git status --short --branch',
            risk: 'read',
            tags: ['status', 'inspect', 'working-tree'],
            sourceUrl: 'https://git-scm.com/docs/git-status',
          },
          {
            id: 'git-diff',
            title: 'Xem phần chưa stage',
            command: 'git diff -- <path>',
            description:
              'So sánh working tree với index cho đường dẫn chọn. Tệp chưa được Git theo dõi không xuất hiện.',
            example: 'git diff -- README.md',
            risk: 'read',
            tags: ['diff', 'inspect', 'unstaged'],
            sourceUrl: 'https://git-scm.com/docs/git-diff',
          },
          {
            id: 'git-diff-staged',
            title: 'Xem phần đã stage',
            command: 'git diff --staged',
            description:
              'Kiểm tra nội dung chuẩn bị commit bằng cách so sánh index với HEAD.',
            example: 'git diff --staged',
            risk: 'read',
            tags: ['diff', 'staged', 'review'],
            sourceUrl: 'https://git-scm.com/docs/git-diff',
          },
          {
            id: 'git-log',
            title: 'Xem lịch sử nhánh',
            command: 'git log --oneline --graph --decorate --max-count=<n>',
            description:
              'Hiện lịch sử ngắn gọn, đồ thị phân nhánh và tên ref; giới hạn số commit hiển thị.',
            example: 'git log --oneline --graph --decorate --max-count=20',
            risk: 'read',
            tags: ['log', 'history', 'graph'],
            sourceUrl: 'https://git-scm.com/docs/git-log',
          },
          {
            id: 'git-show',
            title: 'Xem một commit',
            command: 'git show --stat <commit>',
            description:
              'Xem thông tin commit và thống kê tệp đổi; dùng HEAD để xem commit hiện tại.',
            example: 'git show --stat HEAD',
            risk: 'read',
            tags: ['show', 'commit', 'inspect'],
            sourceUrl: 'https://git-scm.com/docs/git-show',
          },
        ],
      },
      {
        id: 'stage-commit',
        title: 'Stage và commit',
        commands: [
          {
            id: 'git-add-file',
            title: 'Stage tệp cụ thể',
            command: 'git add -- <path>',
            description:
              'Đưa trạng thái hiện tại của đường dẫn vào index cho commit kế tiếp.',
            example: 'git add -- README.md',
            risk: 'write',
            warning:
              'Kiểm tra git diff --staged trước khi commit để tránh đưa nhầm dữ liệu bí mật vào lịch sử.',
            tags: ['add', 'stage', 'file'],
            sourceUrl: 'https://git-scm.com/docs/git-add',
          },
          {
            id: 'git-add-patch',
            title: 'Stage từng phần',
            command: 'git add --patch -- <path>',
            description:
              'Chọn từng khối thay đổi tương tác; dùng y để stage, n để bỏ qua và s để tách khi được hỗ trợ.',
            example: 'git add --patch -- src/app.js',
            risk: 'write',
            tags: ['add', 'patch', 'interactive'],
            sourceUrl: 'https://git-scm.com/docs/git-add',
          },
          {
            id: 'git-unstage',
            title: 'Bỏ stage, giữ tệp',
            command: 'git restore --staged -- <path>',
            description:
              'Đưa bản trong index về HEAD, giữ nguyên nội dung working tree. Cần kho đã có commit.',
            example: 'git restore --staged -- README.md',
            risk: 'write',
            tags: ['restore', 'unstage', 'index'],
            sourceUrl: 'https://git-scm.com/docs/git-restore',
          },
          {
            id: 'git-commit',
            title: 'Lưu commit mới',
            command: 'git commit -m "<message>"',
            description:
              'Tạo commit từ nội dung đã stage với thông điệp mô tả thay đổi.',
            example: 'git commit -m "docs: update setup instructions"',
            risk: 'write',
            tags: ['commit', 'save', 'history'],
            sourceUrl: 'https://git-scm.com/docs/git-commit',
          },
        ],
      },
      {
        id: 'branches',
        title: 'Làm việc với nhánh',
        commands: [
          {
            id: 'git-branch-list',
            title: 'Xem nhánh và upstream',
            command: 'git branch -vv',
            description:
              'Liệt kê nhánh local, commit đầu nhánh và upstream nếu có. Số ahead/behind dựa trên dữ liệu đã fetch.',
            example: 'git branch -vv',
            risk: 'read',
            tags: ['branch', 'upstream', 'inspect'],
            sourceUrl: 'https://git-scm.com/docs/git-branch',
          },
          {
            id: 'git-switch',
            title: 'Chuyển nhánh',
            command: 'git switch <branch>',
            description:
              'Chuyển sang nhánh đã có và cập nhật working tree tương ứng.',
            example: 'git switch main',
            risk: 'write',
            warning:
              'Commit hoặc stash phần đang làm nếu cần. Git từ chối khi việc chuyển nhánh có thể làm mất thay đổi local.',
            tags: ['switch', 'branch', 'checkout'],
            sourceUrl: 'https://git-scm.com/docs/git-switch',
          },
          {
            id: 'git-switch-create',
            title: 'Tạo và chuyển nhánh',
            command: 'git switch -c <new-branch>',
            description:
              'Tạo nhánh mới từ HEAD rồi chuyển sang nhánh đó; báo lỗi nếu tên đã tồn tại.',
            example: 'git switch -c feature/login',
            risk: 'write',
            tags: ['switch', 'branch', 'create'],
            sourceUrl: 'https://git-scm.com/docs/git-switch',
          },
          {
            id: 'git-merge-ff',
            title: 'Gộp bằng fast-forward',
            command: 'git merge --ff-only <branch>',
            description:
              'Đưa nhánh hiện tại tới đầu nhánh chỉ định nếu fast-forward được; từ chối khi lịch sử phân kỳ.',
            example: 'git merge --ff-only feature/login',
            risk: 'write',
            warning:
              'Chạy trên nhánh đích sau khi lưu công việc đang làm. Kiểm tra git status trước khi gộp.',
            tags: ['merge', 'fast-forward', 'branch'],
            sourceUrl: 'https://git-scm.com/docs/git-merge',
          },
          {
            id: 'git-branch-delete',
            title: 'Xóa nhánh đã gộp',
            command: 'git branch -d <branch>',
            description:
              'Xóa nhánh local đã được gộp vào upstream, hoặc HEAD nếu không có upstream.',
            example: 'git branch -d feature/login',
            risk: 'destructive',
            warning:
              'Chuyển sang nhánh khác trước. Tên nhánh và reflog của nó bị xóa; giữ nhánh nếu chưa chắc. Không thay -d bằng -D để ép xóa.',
            tags: ['branch', 'delete', 'cleanup'],
            sourceUrl: 'https://git-scm.com/docs/git-branch',
          },
        ],
      },
      {
        id: 'remote',
        title: 'Đồng bộ remote',
        commands: [
          {
            id: 'git-remote-list',
            title: 'Kiểm tra remote',
            command: 'git remote -v',
            description:
              'Xem tên và URL remote để biết nguồn fetch và đích push.',
            example: 'git remote -v',
            risk: 'read',
            tags: ['remote', 'url', 'inspect'],
            sourceUrl: 'https://git-scm.com/docs/git-remote',
          },
          {
            id: 'git-fetch',
            title: 'Tải lịch sử mới',
            command: 'git fetch <remote>',
            description:
              'Tải object và cập nhật ref theo cấu hình remote; với cấu hình thông thường, chưa gộp vào nhánh đang làm.',
            example: 'git fetch origin',
            risk: 'write',
            tags: ['fetch', 'remote', 'sync'],
            sourceUrl: 'https://git-scm.com/docs/git-fetch',
          },
          {
            id: 'git-pull-ff',
            title: 'Kéo cập nhật an toàn',
            command: 'git pull --ff-only <remote> <branch>',
            description:
              'Fetch rồi cập nhật nhánh hiện tại bằng fast-forward; dừng nếu lịch sử hai bên đã phân kỳ.',
            example: 'git pull --ff-only origin main',
            risk: 'write',
            warning:
              'Ví dụ dành cho nhánh main local. Lưu thay đổi đang làm và kiểm tra nhánh hiện tại trước khi chạy.',
            tags: ['pull', 'fast-forward', 'sync'],
            sourceUrl: 'https://git-scm.com/docs/git-pull',
          },
          {
            id: 'git-push-preview',
            title: 'Xem trước lần push',
            command: 'git push --dry-run <remote> <branch>',
            description:
              'Kiểm tra lần push dự kiến mà không gửi cập nhật ref; vẫn có thể cần mạng và quyền truy cập.',
            example: 'git push --dry-run origin feature/login',
            risk: 'read',
            tags: ['push', 'dry-run', 'preview'],
            sourceUrl: 'https://git-scm.com/docs/git-push',
          },
          {
            id: 'git-push-upstream',
            title: 'Push và đặt upstream',
            command: 'git push --set-upstream <remote> <branch>',
            description:
              'Gửi nhánh lên remote và đặt upstream khi nhánh được push thành công hoặc đã đồng bộ.',
            example: 'git push --set-upstream origin feature/login',
            risk: 'write',
            warning:
              'Công bố commit tới remote. Kiểm tra URL, nhánh và dữ liệu nhạy cảm; dùng --dry-run trước nếu cần.',
            tags: ['push', 'upstream', 'publish'],
            sourceUrl: 'https://git-scm.com/docs/git-push',
          },
        ],
      },
      {
        id: 'stash',
        title: 'Tạm cất công việc',
        commands: [
          {
            id: 'git-stash-push',
            title: 'Cất thay đổi tạm',
            command: 'git stash push --include-untracked -m "<message>"',
            description:
              'Cất thay đổi đã theo dõi và tệp untracked rồi dọn chúng khỏi working tree.',
            example: 'git stash push --include-untracked -m "WIP login form"',
            risk: 'write',
            warning:
              'Không bao gồm tệp ignored. Stash chỉ lưu local, không thay thế bản sao lưu.',
            tags: ['stash', 'save', 'untracked'],
            sourceUrl: 'https://git-scm.com/docs/git-stash',
          },
          {
            id: 'git-stash-list',
            title: 'Liệt kê stash',
            command: 'git stash list',
            description: 'Xem các bản cất tạm; stash@{0} là bản mới nhất.',
            example: 'git stash list',
            risk: 'read',
            tags: ['stash', 'list', 'inspect'],
            sourceUrl: 'https://git-scm.com/docs/git-stash',
          },
          {
            id: 'git-stash-show',
            title: 'Xem nội dung stash',
            command: 'git stash show --patch --include-untracked "<stash>"',
            description:
              'Xem patch của bản stash, gồm cả tệp untracked đã cất.',
            example: 'git stash show --patch --include-untracked "stash@{0}"',
            risk: 'read',
            tags: ['stash', 'diff', 'review'],
            sourceUrl: 'https://git-scm.com/docs/git-stash',
          },
          {
            id: 'git-stash-apply',
            title: 'Lấy lại, giữ stash',
            command: 'git stash apply "<stash>"',
            description:
              'Áp dụng thay đổi vào working tree và giữ nguyên mục stash.',
            example: 'git stash apply "stash@{0}"',
            risk: 'write',
            warning:
              'Có thể xung đột. Dùng working tree sạch để dễ xử lý; trạng thái stage không tự khôi phục.',
            tags: ['stash', 'apply', 'restore'],
            sourceUrl: 'https://git-scm.com/docs/git-stash',
          },
        ],
      },
      {
        id: 'undo',
        title: 'Hoàn tác có kiểm soát',
        commands: [
          {
            id: 'git-reflog',
            title: 'Tìm HEAD trước đó',
            command: 'git reflog show --max-count=<n>',
            description:
              'Tra các lần HEAD đổi trong kho local, hữu ích để tìm lại commit sau reset hoặc chuyển nhánh.',
            example: 'git reflog show --max-count=20',
            risk: 'read',
            warning:
              'Reflog có thể hết hạn và không phải lịch sử chung của remote.',
            tags: ['reflog', 'recovery', 'history'],
            sourceUrl: 'https://git-scm.com/docs/git-reflog',
          },
          {
            id: 'git-revert',
            title: 'Đảo một commit',
            command: 'git revert --no-edit <commit>',
            description:
              'Tạo commit mới đảo thay đổi của commit chọn, giữ nguyên lịch sử đã có.',
            example: 'git revert --no-edit HEAD',
            risk: 'write',
            warning:
              'Cần working tree sạch. Ví dụ giả định HEAD là commit thường; merge commit cần xử lý riêng. Có thể xung đột.',
            tags: ['revert', 'undo', 'shared-history'],
            sourceUrl: 'https://git-scm.com/docs/git-revert',
          },
          {
            id: 'git-amend-message',
            title: 'Sửa lời commit cuối',
            command: 'git commit --amend --only -m "<message>"',
            description:
              'Thay thông điệp commit cuối; --only không lấy các thay đổi đang stage khi không chỉ định đường dẫn.',
            example:
              'git commit --amend --only -m "docs: clarify setup instructions"',
            risk: 'destructive',
            warning:
              'Tạo mã commit mới và viết lại lịch sử nhánh. Chỉ dùng cho commit chưa chia sẻ; nếu đã push, ưu tiên commit bổ sung.',
            tags: ['amend', 'rewrite', 'message'],
            sourceUrl: 'https://git-scm.com/docs/git-commit',
          },
          {
            id: 'git-restore-worktree',
            title: 'Bỏ phần chưa stage',
            command: 'git restore --worktree -- <path>',
            description:
              'Ghi nội dung từ index lên đường dẫn trong working tree, bỏ thay đổi chưa stage của tệp đó.',
            example: 'git restore --worktree -- README.md',
            risk: 'destructive',
            warning:
              'Thay đổi chưa lưu có thể mất vĩnh viễn. Xem git diff và stash trước; muốn chỉ bỏ stage thì dùng git restore --staged.',
            tags: ['restore', 'discard', 'working-tree'],
            sourceUrl: 'https://git-scm.com/docs/git-restore',
          },
          {
            id: 'git-reset-soft',
            title: 'Rút commit, giữ nội dung',
            command: 'git reset --soft <commit>',
            description:
              'Đưa đầu nhánh về commit chọn, giữ nguyên index và working tree. Ví dụ rút một commit để chuẩn bị commit lại.',
            example: 'git reset --soft HEAD~1',
            risk: 'destructive',
            warning:
              'Đổi lịch sử nhánh; chỉ dùng khi commit chưa chia sẻ và HEAD có commit cha. Với lịch sử đã push, ưu tiên git revert. Không thay bằng --hard.',
            tags: ['reset', 'soft', 'rewrite'],
            sourceUrl: 'https://git-scm.com/docs/git-reset',
          },
        ],
      },
    ],
  },
];
