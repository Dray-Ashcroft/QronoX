<p align="center">
  <img src="assets/banner.png" alt="QronoX — Interactive Quartz Clock Simulator" width="100%">
</p>

🕰️ **QronoX**

Interactive Quartz Clock Simulator

> QronoX simulates how quartz vibrations power digital timekeeping, from frequency division to display and accuracy.

🔮 Quartz Oscillation · ⚡ Frequency Division · ⏱️ Digital Timekeeping

🔬 **Explore the Simulation**

---

✦ **Features**

- 💎 Quartz crystal: explore tuning-fork vibration, electrode polarity and feedback amplification
- ⚡ Frequency divider: visualize 15 stages reducing 32,768 Hz to 1 Hz
- ⏱️ Digital counter: observe seconds, minutes, hours and counter rollover
- 🔢 Seven-segment display: explore how numerical digits are represented
- 🌡️ Temperature and accuracy: investigate modeled frequency drift and timekeeping error
- 🔋 Interactive controls: remove the battery, synchronize the watch, and freeze or resume the simulation
- 🎚️ Variable speed: slow crystal oscillations for easier observation
- 📚 Guided learning tour: explore the working principles step by step
- 📱 Responsive interface: works on desktop and mobile

---

📃 **Principle**

---

## 📃 Principle

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

### 🔢 Frequency Division

The quartz crystal oscillates at 32,768 Hz. Fifteen successive divide-by-two stages produce one pulse per second.

$$
32768 = 2^{15}
$$

$$
\frac{32768\ \text{Hz}}{2^{15}} = 1\ \text{Hz}
$$

📟 **Frequency Division**

$$
32768 = 2^{15}
$$

$$
\frac{32768\ \text{Hz}}{2^{15}} = 1\ \text{Hz}
$$


---

👨🏻‍💻 **Technology**

HTML · CSS · JavaScript · SVG · Canvas API

- Visualization: SVG-based crystal, circuit and seven-segment illustrations
- Graphing: Canvas-based temperature–frequency curve
- Typography: IBM Plex Sans and Roboto
- Architecture: browser-native technologies without a JavaScript framework


---

📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
