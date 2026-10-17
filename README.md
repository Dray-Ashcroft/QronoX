<p align="center">
  <img src="assets/banner.png" alt="QronoX — Interactive Quartz Clock Simulator" width="100%">
</p>

📟 **QronoX**

**Interactive Quartz Clock Simulator**

> QronoX simulates how quartz vibrations power digital timekeeping, from frequency division to display and accuracy.

🔮 Quartz Oscillation · ⚡ Frequency Division · ⏱️ Digital Timekeeping

🕔 [**Explore the Simulation**](https://YOUR-CLOUDFLARE-PROJECT.pages.dev/)

---

✦ **Features**

```mermaid
flowchart TD
    A["💎 Quartz Crystal"] --> B["⚡ Frequency Divider"]
    B --> C["⏱️ Digital Counter"]
    C --> D["🔢 Seven-Segment Display"]

    E["🌡️ Temperature and Accuracy"]
    F["🔋 Interactive Controls"]
    G["🎚️ Variable Speed"]
    H["📱 Responsive Interface"]

    style A fill:#102c46,stroke:#35aaff,color:#ffffff
    style B fill:#292044,stroke:#ad82ff,color:#ffffff
    style C fill:#3d3017,stroke:#ffc34d,color:#ffffff
    style D fill:#401d20,stroke:#ff6868,color:#ffffff
    style E fill:#103a35,stroke:#25d9b7,color:#ffffff
    style F fill:#332b18,stroke:#f5b942,color:#ffffff
    style G fill:#102e38,stroke:#35d9f5,color:#ffffff
    style H fill:#202b3a,stroke:#9bb5d1,color:#ffffff
```
---

📃 **Working Principle**

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

📝 **Frequency Division**

$$
32768 = 2^{15}
$$

$$
\frac{32768\ \text{Hz}}{2^{15}} = 1\ \text{Hz}
$$

---

👨🏻‍💻 **Technology**

**HTML** · **CSS** · **JavaScript** ·**SVG** · **Canvas API**

---

📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
