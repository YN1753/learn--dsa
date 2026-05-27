function l(e){return{data:e,next:null}}function h(e){const t=[];let u=e;for(;u!==null;)t.push(u.data),u=u.next;return t.join(" -> ")+" -> null"}function d(){const e=[];e.push(`=== 链表演示 ===
`),e.push("1. 创建链表: 1 -> 2 -> 3");let t=l(1);t.next=l(2),t.next.next=l(3),e.push(`   当前链表: ${h(t)}
`),e.push("2. 在头部插入 0");const u=l(0);u.next=t,t=u,e.push(`   当前链表: ${h(t)}
`),e.push("3. 在尾部插入 4");let n=t;for(;n.next!==null;)n=n.next;n.next=l(4),e.push(`   当前链表: ${h(t)}
`),e.push("4. 在位置 2 插入 99 (在 2 和 3 之间)"),n=t;for(let o=0;o<1;o++)n.next!==null&&(n=n.next);const x=l(99);if(x.next=n.next,n.next=x,e.push(`   当前链表: ${h(t)}
`),e.push("5. 删除值为 99 的节点"),t.data===99)t=t.next;else{for(n=t;n.next!==null&&n.next.data!==99;)n=n.next;n.next!==null&&(n.next=n.next.next)}e.push(`   当前链表: ${h(t)}
`),e.push("6. 搜索值为 3 的节点");let s=t,i=0,p=!1;for(;s!==null;){if(s.data===3){e.push(`   找到节点，值为 ${s.data}，位置为 ${i}`),p=!0;break}s=s.next,i++}p||e.push("   未找到节点"),e.push(""),e.push("7. 遍历整个链表:");let r=t,a=0;for(;r!==null;)e.push(`   位置 ${a}: 值 = ${r.data}`),r=r.next,a++;return e.push(""),e.push("=== 演示结束 ==="),e.join(`
`)}export{d as default};
