const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace input !bg-white combinations
  content = content.replace(/!bg-white !text-\[var\(--color-card-text\)\]/g, '!bg-[var(--color-bg)] !text-[var(--color-text-primary)]');
  
  // Replace card bg-white with bg-[var(--color-surface)]
  content = content.replace(/\bbg-white\b/g, 'bg-[var(--color-surface)]');

  // Fix truncate issue on repo links by replacing 'truncate' with 'min-w-[150px]' for those specific edits
  content = content.replace(/c="text-\[10px\] font-mono text-\[var\(--color-text-muted\)\] hover:text-blue-500 truncate bg-\[var\(--color-surface-muted\)\] px-1\.5 py-0\.5 rounded"/g, 
                            'c="text-[10px] font-mono text-[var(--color-text-muted)] hover:text-blue-500 bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded overflow-hidden max-w-full"');
  content = content.replace(/!bg-transparent text-\[11px\] font-bold text-\[var\(--color-card-text-secondary\)\] outline-none cursor-pointer p-0 border-none/g,
                            '!bg-transparent text-[11px] font-bold text-[var(--color-text-secondary)] outline-none cursor-pointer p-0 border-none');

  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/components/crm/AdminDashboard.tsx');
fixFile('src/components/crm/ClientPortalView.tsx');
console.log("Done");
