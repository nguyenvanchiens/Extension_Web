import React, { useState } from 'react';
import './HelperPage.css';

const GUIDES = [
  {
    id: 'monsterasp',
    title: 'Publish API ASP.NET Core lên MonsterASP',
    icon: '🚀',
    description: 'Dành cho Blazor Server, Web API, Razor Pages',
    steps: [
      {
        title: 'Tạo dự án',
        content: [
          'Mở Visual Studio hoặc Visual Studio Code',
          'Tạo project mới: chọn <strong>ASP.NET Core Web Application</strong>',
          'Chọn template: <strong>Web API</strong> hoặc <strong>Web Application (Razor Pages)</strong> tùy nhu cầu',
          'Đặt tên project và chọn thư mục lưu trữ',
        ],
      },
      {
        title: 'Phát triển & kiểm tra',
        content: [
          'Cài đặt các package, middleware, controller, service... như bình thường',
          'Kiểm tra app chạy ổn định ở localhost trước khi publish',
          'Chạy thử bằng <code>F5</code> hoặc <code>dotnet run</code> để đảm bảo API trả về kết quả đúng',
        ],
      },
      {
        title: 'Publish dự án',
        content: [
          'Mở project trong Visual Studio',
          'Chuột phải vào project &rarr; chọn <strong>Publish</strong>',
          'Trong cửa sổ Publish:',
          '&nbsp;&nbsp;&bull; Chọn <strong>Folder</strong> làm đích đến',
          '&nbsp;&nbsp;&bull; Chọn hoặc tạo một profile publish mới',
          '&nbsp;&nbsp;&bull; Chọn thư mục (VD: <code>C:\\MyProject\\publish</code>) để lưu file đã publish',
          '&nbsp;&nbsp;&bull; Nhấn <strong>Publish</strong>',
          'Sau khi publish hoàn tất, bạn sẽ thấy thư mục chứa đầy đủ file <code>.dll</code>, <code>.json</code>, <code>web.config</code>, <code>wwwroot</code>... sẵn sàng triển khai',
        ],
      },
      {
        title: 'Chuẩn bị upload',
        content: [
          'Truy cập thư mục publish',
          'Chọn <strong>toàn bộ file và thư mục bên trong</strong>, nén thành 1 file <code>.zip</code>',
          '<em>Lưu ý: Chỉ nén nội dung bên trong, không nén cả thư mục cha</em>',
        ],
      },
      {
        title: 'Tạo website trên MonsterASP',
        content: [
          'Truy cập: <a href="https://admin.monsterasp.net/" target="_blank">admin.monsterasp.net</a>',
          'Đăng nhập tài khoản',
          'Vào menu <strong>Files</strong> &rarr; <strong>Create new service</strong> &rarr; <strong>Create website</strong>',
          'Chọn gói hosting (dùng thử &rarr; chọn bản miễn phí)',
          'Điền tên website và các thông tin cần thiết',
          'Khi hoàn tất, website sẽ hiển thị trong danh sách',
        ],
      },
      {
        title: 'Upload & triển khai',
        content: [
          '<strong>Cách 1: Upload thủ công</strong>',
          '&nbsp;&nbsp;&bull; Trong phần quản lý file &rarr; truy cập <code>wwwroot</code> của site vừa tạo',
          '&nbsp;&nbsp;&bull; Upload file <code>.zip</code> lên',
          '&nbsp;&nbsp;&bull; Chuột phải vào file <code>.zip</code> &rarr; chọn <strong>Extract</strong>',
          '&nbsp;&nbsp;&bull; Đảm bảo các file được giải nén đúng trong thư mục gốc',
          '&nbsp;&nbsp;&bull; Truy cập website để kiểm tra',
          '',
          '<strong>Cách 2: Dùng FTP Publish Profile</strong>',
          '&nbsp;&nbsp;&bull; Truy cập trang <strong>Deploy</strong> của site trong Admin MonsterASP',
          '&nbsp;&nbsp;&bull; Tải về file cấu hình <code>.PublishSettings</code>',
          '&nbsp;&nbsp;&bull; Trong Visual Studio: Chuột phải project &rarr; <strong>Publish</strong> &rarr; <strong>Import Profile...</strong>',
          '&nbsp;&nbsp;&bull; Chọn file <code>.PublishSettings</code> vừa tải',
          '&nbsp;&nbsp;&bull; Lần sau chỉ cần bấm <strong>Publish</strong> &rarr; Visual Studio tự upload qua FTP',
        ],
      },
      {
        title: 'Kiểm tra kết quả',
        content: [
          'Truy cập đường dẫn website bạn vừa tạo',
          'Kiểm tra bằng cách gọi các endpoint API hoặc truy cập trang chủ',
          'Nếu mọi thứ đúng, website hoặc API của bạn sẽ hoạt động',
        ],
      },
    ],
  },
  {
    id: 'cloudflare-blazor',
    title: 'Deploy Blazor WebAssembly lên Cloudflare Pages',
    icon: '☁️',
    description: 'Dành cho Blazor WASM Standalone (chỉ giao diện, không có API)',
    steps: [
      {
        title: 'Tạo dự án Blazor',
        content: [
          'Mở Visual Studio Code',
          'Tạo dự án <strong>Blazor WebAssembly Standalone App</strong>',
          'Đây là dạng ứng dụng chỉ giao diện (client-side), không cấu hình API phía server',
        ],
      },
      {
        title: 'Build dự án',
        content: [
          'Mở terminal, đứng ở folder chứa <code>wwwroot</code> và chạy lệnh:',
          '<code>dotnet publish -c Release -o build</code>',
          'Sau khi chạy xong, thư mục <code>build/wwwroot/</code> sẽ chứa toàn bộ file tĩnh: <code>index.html</code>, <code>.dll</code>, <code>.js</code>, <code>.css</code>...',
        ],
      },
      {
        title: 'Deploy lên Cloudflare Pages',
        content: [
          'Truy cập: <a href="https://dash.cloudflare.com/" target="_blank">dash.cloudflare.com</a> &rarr; Đăng nhập',
          'Vào <strong>Workers & Pages</strong> &rarr; tab <strong>Pages</strong> &rarr; <strong>Direct Upload</strong>',
          'Đặt tên cho project &rarr; hệ thống tạo domain tạm',
          'Nhấn <strong>Upload folder</strong> &rarr; chọn toàn bộ nội dung trong <code>build/wwwroot/</code>',
          '<em>Lưu ý: Chỉ chọn nội dung bên trong, không chọn cả thư mục wwwroot</em>',
          'Nhấn <strong>Deploy site</strong>',
          'Truy cập domain tạm để kiểm tra kết quả',
        ],
      },
      {
        title: 'Trỏ domain riêng (tuỳ chọn)',
        content: [
          'Sau khi domain đã <strong>Active</strong> trong Cloudflare, quay lại dashboard',
          'Vào project Pages &rarr; tab <strong>Custom domains</strong> &rarr; <strong>Set up a custom domain</strong>',
          'Nhập tên domain của bạn &rarr; xác nhận',
          'Khi domain hiện trạng thái <strong>Active</strong> &rarr; hoàn tất',
        ],
      },
    ],
    summary: [
      'Tạo & build Blazor WebAssembly: <code>dotnet publish -c Release -o build</code>',
      'Upload nội dung <code>build/wwwroot/</code> lên Cloudflare Pages &rarr; Deploy',
      'Thêm domain vào Cloudflare &rarr; trỏ nameservers',
      'Gắn domain vào dự án Pages &rarr; Active &rarr; Chạy',
    ],
  },
  {
    id: 'github-pages',
    title: 'Trỏ GitHub Pages về domain riêng',
    icon: '🔗',
    description: 'Cấu hình custom domain cho GitHub Pages',
    steps: [
      {
        title: 'Đẩy source code lên GitHub',
        content: [
          'Tạo repository trên GitHub (public hoặc private)',
          'Push source code lên GitHub như bình thường',
        ],
      },
      {
        title: 'Bật GitHub Pages',
        content: [
          'Truy cập repository &rarr; tab <strong>Settings</strong>',
          'Trong sidebar chọn <strong>Pages</strong>',
          'Phần <strong>Build and deployment</strong>:',
          '&nbsp;&nbsp;&bull; Source: chọn <strong>Deploy from a branch</strong>',
          '&nbsp;&nbsp;&bull; Branch: chọn <code>main</code> hoặc <code>gh-pages</code>, folder <code>/ (root)</code> hoặc <code>/docs</code>',
          'GitHub sẽ sinh domain tạm: <code>your-username.github.io</code>',
        ],
      },
      {
        title: 'Thêm file CNAME',
        content: [
          'Trong thư mục gốc của repo (cùng cấp với <code>index.html</code>), tạo file tên <code>CNAME</code>',
          'Bên trong file, dán domain riêng của bạn, ví dụ: <code>yourdomain.vn</code>',
          'Commit và push file này lên GitHub',
          'GitHub Pages sẽ tự nhận diện domain riêng của bạn',
        ],
      },
      {
        title: 'Cấu hình DNS',
        content: [
          'Truy cập quản lý domain (VD: ZoneDNS, Cloudflare, GoDaddy...)',
          '',
          '<strong>Bản ghi A (trỏ domain gốc, không www):</strong>',
        ],
        table: {
          headers: ['Type', 'Name', 'Value'],
          rows: [
            ['A', '@', '185.199.108.153'],
            ['A', '@', '185.199.109.153'],
            ['A', '@', '185.199.110.153'],
            ['A', '@', '185.199.111.153'],
          ],
        },
        contentAfterTable: [
          '<em>GitHub Pages phân phối qua nhiều IP để tăng khả năng chịu tải và giảm nguy cơ downtime. Có thể dùng 1, nhưng nên dùng đủ 4.</em>',
          '',
          '<strong>Bản ghi CNAME (trỏ www):</strong>',
        ],
        table2: {
          headers: ['Type', 'Name', 'Value'],
          rows: [
            ['CNAME', 'www', 'your-username.github.io'],
          ],
        },
        contentAfterTable2: [
          '<em>Tên CNAME <code>www</code> nghĩa là <code>www.yourdomain.vn</code> sẽ trỏ về GitHub Pages</em>',
        ],
      },
      {
        title: 'Kiểm tra & hoàn tất',
        content: [
          'Đợi DNS cập nhật (khoảng 5 &ndash; 30 phút)',
          'Truy cập domain bạn vừa cấu hình',
          'Nếu hiển thị site GitHub Pages &rarr; thành công',
          '<em>Nếu <code>www</code> chạy mà domain gốc không chạy (hoặc ngược lại), bật redirect bên DNS provider hoặc cấu hình thêm bản ghi</em>',
        ],
      },
    ],
  },
];

function HelperPage() {
  const [activeGuide, setActiveGuide] = useState('monsterasp');
  const [expandedSteps, setExpandedSteps] = useState({});

  const guide = GUIDES.find((g) => g.id === activeGuide);

  const toggleStep = (index) => {
    setExpandedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const expandAll = () => {
    const all = {};
    guide.steps.forEach((_, i) => { all[i] = true; });
    setExpandedSteps(all);
  };

  const collapseAll = () => {
    setExpandedSteps({});
  };

  const renderTable = (table) => (
    <table className="guide-table">
      <thead>
        <tr>
          {table.headers.map((h, i) => <th key={i}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => <td key={j}><code>{cell}</code></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <header className="page-header">
        <h1>Helper</h1>
        <p className="page-subtitle">Hướng dẫn Publish & Triển khai ứng dụng</p>
      </header>

      <div className="guide-nav">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            className={`guide-nav-btn ${activeGuide === g.id ? 'active' : ''}`}
            onClick={() => { setActiveGuide(g.id); setExpandedSteps({}); }}
          >
            <span className="guide-nav-icon">{g.icon}</span>
            <div className="guide-nav-text">
              <span className="guide-nav-title">{g.title}</span>
              <span className="guide-nav-desc">{g.description}</span>
            </div>
          </button>
        ))}
      </div>

      {guide && (
        <div className="guide-content">
          <div className="guide-header">
            <h2>{guide.icon} {guide.title}</h2>
            <div className="guide-actions">
              <button className="guide-action-btn" onClick={expandAll}>Mở tất cả</button>
              <button className="guide-action-btn" onClick={collapseAll}>Thu gọn</button>
            </div>
          </div>

          <div className="guide-steps">
            {guide.steps.map((step, i) => (
              <div key={i} className={`guide-step ${expandedSteps[i] ? 'expanded' : ''}`}>
                <button className="guide-step-header" onClick={() => toggleStep(i)}>
                  <span className="guide-step-number">{i + 1}</span>
                  <span className="guide-step-title">{step.title}</span>
                  <span className="guide-step-arrow">{expandedSteps[i] ? '▾' : '▸'}</span>
                </button>
                {expandedSteps[i] && (
                  <div className="guide-step-body">
                    {step.content && step.content.map((line, j) => (
                      line === '' ? <div key={j} className="guide-spacer"></div> :
                      <div key={j} className="guide-line" dangerouslySetInnerHTML={{ __html: line }} />
                    ))}
                    {step.table && renderTable(step.table)}
                    {step.contentAfterTable && step.contentAfterTable.map((line, j) => (
                      line === '' ? <div key={`at${j}`} className="guide-spacer"></div> :
                      <div key={`at${j}`} className="guide-line" dangerouslySetInnerHTML={{ __html: line }} />
                    ))}
                    {step.table2 && renderTable(step.table2)}
                    {step.contentAfterTable2 && step.contentAfterTable2.map((line, j) => (
                      <div key={`at2${j}`} className="guide-line" dangerouslySetInnerHTML={{ __html: line }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {guide.summary && (
            <div className="guide-summary">
              <h3>Tóm tắt nhanh</h3>
              {guide.summary.map((line, i) => (
                <div key={i} className="guide-summary-item">
                  <span className="guide-check">✅</span>
                  <span dangerouslySetInnerHTML={{ __html: line }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default HelperPage;
