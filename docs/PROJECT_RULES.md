# PROJECT_RULES.md

# Computer Networks Learning System — Project Rules

> 专用于《计算机网络》交互式学习系统的项目规则。
> 本文件定义：
>
> - 网络协议模拟规范
> - 数据包可视化规则
> - 状态机行为
> - 拓扑展示方式
> - 动画规则
> - AI Agent 自动生成约束

---

# 1. System Philosophy

这是一个：

# Simulation-First Networking Learning System

核心不是：

- PPT
- 静态图
- 卡片介绍
- 文档站

而是：

# 用户亲手操作网络协议。

用户必须能够：

- 构造数据包
- 修改协议参数
- 观察状态变化
- 看到分层封装
- 跟踪路由过程
- 观察拥塞与重传
- 模拟网络故障

---

# 2. Core Visualization Philosophy

所有网络主题必须满足：

```txt
用户操作
→ 网络状态改变
→ 数据流变化
→ 可视化反馈
3. Mandatory Networking Visual Patterns

所有 Topic 至少使用一种：

Pattern	用途
Packet Flow	数据包流动
Layer Stack	协议分层
State Machine	TCP/协议状态
Queue Timeline	队列/拥塞
Routing Graph	路由路径
Broadcast Domain	广播传播
Sliding Window	窗口机制
ARP Table	地址解析
DNS Resolution Chain	DNS 查询
Congestion Graph	拥塞控制
4. Rendering Rules

必须使用：

DOM
Tailwind
inline SVG

禁止：

Canvas
D3.js
Three.js
Chart.js
Framer Motion
5. Packet Visualization Standard

所有数据包必须统一视觉语言：

+----------------+
| Ethernet Header|
+----------------+
| IP Header      |
+----------------+
| TCP/UDP Header |
+----------------+
| Payload        |
+----------------+

颜色语义：

Layer	Color
Physical	gray
Data Link	amber
Network	blue
Transport	green
Application	purple
6. Animation Rules

网络动画必须：

状态驱动
可暂停
可逐步执行
可 reset

禁止：

无限自动播放
不可控制动画
requestAnimationFrame
keyframes
7. Interaction Requirements

每个 Topic 必须允许用户至少操作：

Interaction	Example
Toggle	开启/关闭丢包
Input	修改 RTT
Select	选择路由协议
Step Execute	单步发送 packet
Drag	调整拓扑结构
8. Topic Structure

每个 Topic：

Article
↓
Interactive Visualization
↓
Quiz

不能改变顺序。

9. Networking-Specific Simulation Rules
TCP

必须展示：

SYN
ACK
FIN
Seq/Ack Number
Sliding Window
Retransmission
Routing

必须展示：

hop-by-hop forwarding
routing table
shortest path
dynamic update
DNS

必须展示：

Browser
→ Local DNS
→ Root
→ TLD
→ Authoritative
ARP

必须展示：

ARP request broadcast
ARP reply unicast
ARP cache update
Congestion Control

必须展示：

cwnd
slow start
congestion avoidance
packet loss
timeout
10. UI Rules

所有网络设备：

Device	Shape
Router	Circle
Switch	Rounded rectangle
Host	Square
Server	Tall rectangle

连接线：

inactive → gray
active flow → blue
dropped → red
acknowledged → green
11. Performance Rules

禁止：

高频 re-render
超大 topology
复杂 SVG path 动画

必须：

使用小规模教学网络
控制 state complexity
低复杂度动画
12. Autonomous Agent Rules

AI Agent 在生成 Topic 时必须：

先确定协议类别
选择 Visualization Category
定义 packet/state schema
生成 article
生成 visualization
生成 quiz
npm run build
commit
13. Never Do These

禁止：

静态流程图替代 simulation
黑盒动画
自动播放不可暂停
复杂企业级 UI
真实抓包依赖
使用外部协议库
14. Build Priority

优先级：

1. Simulation correctness
2. Interaction quality
3. Protocol visualization clarity
4. UI polish