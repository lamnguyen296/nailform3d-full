const fs = require('fs');
const path = require('path');

const dir = 'd:/nailform3d be-fe/nailform-project (fe) root/nailform3d/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Replace currencies
  content = content.replace(/1\.250\.000\.000đ/g, '1,250,000,000 VND');
  content = content.replace(/420\.000\.000đ/g, '420,000,000 VND');
  content = content.replace(/42\.000\.000đ/g, '42,000,000 VND');
  content = content.replace(/499\.000đ/g, '499,000 VND');
  content = content.replace(/299\.000đ/g, '299,000 VND');
  content = content.replace(/1\.999\.000đ/g, '1,999,000 VND');
  content = content.replace(/2\.999\.000đ/g, '2,999,000 VND');
  content = content.replace(/4\.999\.000đ/g, '4,999,000 VND');
  content = content.replace(/450\.000đ/g, '450,000 VND');
  content = content.replace(/120\.000đ/g, '120,000 VND');
  content = content.replace(/60\.000đ/g, '60,000 VND');
  content = content.replace(/0đ/g, '0 VND');

  // Replace specific text
  content = content.replace(/Bảng điều hành Overview/g, 'Overview Dashboard');
  content = content.replace(/Gói Đăng ký/g, 'Subscription Plan');
  content = content.replace(/Gói Đăng Ký/g, 'Subscription Plan');
  content = content.replace(/Chuyển hướng sang trang thanh toán riêng biệt/g, 'Redirect to specific payment page');
  content = content.replace(/đánh giá/g, 'reviews');
  content = content.replace(/Chưa có reviews/g, 'No reviews yet');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
