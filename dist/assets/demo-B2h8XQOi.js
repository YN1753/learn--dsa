function $(){const s=[];s.push(`=== 数组 (Array) 操作演示 ===
`);const u=[10,25,33,47,58,62,79];s.push(`初始数组: [${u.join(", ")}]`),s.push(`数组长度: ${u.length}
`),s.push("--- 随机访问 ---");for(const p of[0,3,6])s.push(`  arr[${p}] = ${u[p]}  (O(1) 时间复杂度)`);s.push(""),s.push("--- 线性查找: 查找 47 ---");const r=47;let t=!1;for(let p=0;p<u.length;p++)if(s.push(`  第 ${p+1} 步: 比较 arr[${p}] = ${u[p]} 与 ${r}`),u[p]===r){s.push(`  ✓ 找到! 索引为 ${p}`),t=!0;break}t||s.push("  ✗ 未找到"),s.push(""),s.push("--- 末尾插入: 在末尾添加 85 ---"),u.push(85),s.push(`  插入后: [${u.join(", ")}]`),s.push(`  时间复杂度: O(1)
`),s.push("--- 指定位置插入: 在索引 3 处插入 40 ---");const h=3;s.push(`  插入前: [${u.join(", ")}]`),u.push(0);for(let p=u.length-1;p>h;p--)u[p]=u[p-1],s.push(`  移动: arr[${p-1}] -> arr[${p}]`);u[h]=40,s.push(`  插入 arr[${h}] = 40`),s.push(`  插入后: [${u.join(", ")}]`),s.push(`  时间复杂度: O(n) (需要移动元素)
`),s.push("--- 删除操作: 删除索引 2 处的元素 ---");const n=2,e=u[n];s.push(`  删除前: [${u.join(", ")}]`),s.push(`  删除元素: arr[${n}] = ${e}`);for(let p=n;p<u.length-1;p++)u[p]=u[p+1],s.push(`  移动: arr[${p+1}] -> arr[${p}]`);u.pop(),s.push(`  删除后: [${u.join(", ")}]`),s.push(`  时间复杂度: O(n) (需要移动元素)
`),s.push("--- 末尾删除 ---");const o=u.pop();return s.push(`  删除末尾元素: ${o}`),s.push(`  删除后: [${u.join(", ")}]`),s.push(`  时间复杂度: O(1)
`),s.push("=== 时间复杂度总结 ==="),s.push("  随机访问:        O(1)"),s.push("  线性查找:        O(n)"),s.push("  末尾插入:        O(1)"),s.push("  指定位置插入:    O(n)"),s.push("  末尾删除:        O(1)"),s.push("  指定位置删除:    O(n)"),s.join(`
`)}export{$ as default};
