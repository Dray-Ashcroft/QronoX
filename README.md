<p align="center">
  <img src="assets/banner.png" alt="QronoX — Interactive Quartz Clock Simulator" width="100%">
</p>

📟 **QronoX**

**Interactive Quartz Clock Simulator**

> QronoX simulates how quartz vibrations power digital timekeeping, from frequency division to display and accuracy.

🔮 Quartz Oscillation · ⚡ Frequency Division · ⏱️ Digital Timekeeping

🕔 [**Explore the Simulation**](https://qronox.stark-kodex.workers.dev)

---

📃 **Features**

```mermaid
flowchart TD
    A["🔋 Battery"] --> B["💎 Quartz Crystal<br/>32,768 Hz"]
    B --> C["⚡ Oscillator & Feedback Loop"]
    C --> D["🔄 Frequency Divider<br/>15 stages"]
    D --> E["⏱️ 1 Hz Pulse"]
    E --> F["🔢 Digital Counter"]
    F --> G["Seconds"]
    F --> H["Minutes"]
    F --> I["Hours"]
    G --> J["🕰️ Seven-Segment Display"]
    H --> J
    I --> J

    style A fill:#332b18,stroke:#f5b942,color:#ffffff
    style B fill:#102c46,stroke:#35aaff,color:#ffffff
    style C fill:#103a35,stroke:#25d9b7,color:#ffffff
    style D fill:#292044,stroke:#ad82ff,color:#ffffff
    style E fill:#3d3017,stroke:#ffc34d,color:#ffffff
    style F fill:#401d20,stroke:#ff6868,color:#ffffff
    style J fill:#102e38,stroke:#35d9f5,color:#ffffff
```

⚡ **Frequency Division**

A 32,768 Hz clock signal can be divided by (2^{15}) to produce a 1 Hz signal.

$$
32768 = 2^{15}
$$

Step-by-step division:

$$
\begin{aligned}
32768 &\div 2 = 16384\
16384 &\div 2 = 8192\
8192 &\div 2 = 4096\
4096 &\div 2 = 2048\
2048 &\div 2 = 1024\
1024 &\div 2 = 512\
512 &\div 2 = 256\
256 &\div 2 = 128\
128 &\div 2 = 64\
64 &\div 2 = 32\
32 &\div 2 = 16\
16 &\div 2 = 8\
8 &\div 2 = 4\
4 &\div 2 = 2\
2 &\div 2 = 1
\end{aligned}
$$

Result:

$$
\frac{32768\ \text{Hz}}{2^{15}} = 1\ \text{Hz}
$$

Each division by 2 halves the frequency. After 15 divisions, the output is a 1 Hz signal, producing one cycle per second.
---

👨🏻‍💻 **Technology**

**HTML** · **CSS** · **JavaScript** ·**SVG** · **Canvas API**

---

📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
