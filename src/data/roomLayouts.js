module.exports = {
  room_small_a: {
    platforms: [
      { x:0.16, y:0.68, w:0.22, h:0.035 },
      { x:0.62, y:0.57, w:0.20, h:0.035 }
    ],
    props: [
      { type:"crate", x:0.10, y:0.80, w:42, h:34 },
      { type:"machine", x:0.78, y:0.73, w:58, h:62 },
      { type:"pipe", x:0.48, y:0.18, w:110, h:18 }
    ],
    signs: [
      { text:"NEON KITCHEN", x:0.50, y:0.18, color:"#FF4FD8" }
    ]
  },
  room_mid_a: {
    platforms: [
      { x:0.10, y:0.62, w:0.18, h:0.035 },
      { x:0.39, y:0.50, w:0.22, h:0.035 },
      { x:0.71, y:0.64, w:0.18, h:0.035 }
    ],
    props: [
      { type:"counter", x:0.08, y:0.79, w:86, h:38 },
      { type:"tank", x:0.73, y:0.70, w:64, h:74 },
      { type:"vent", x:0.46, y:0.23, w:54, h:32 }
    ],
    signs: [
      { text:"OPEN 24H", x:0.50, y:0.16, color:"#35D7FF" }
    ]
  },
  room_shop: {
    platforms: [
      { x:0.24, y:0.62, w:0.18, h:0.035 },
      { x:0.58, y:0.62, w:0.18, h:0.035 }
    ],
    props: [
      { type:"shelf", x:0.10, y:0.59, w:70, h:110 },
      { type:"counter", x:0.42, y:0.78, w:110, h:42 },
      { type:"shelf", x:0.78, y:0.59, w:70, h:110 }
    ],
    signs: [
      { text:"LATE SHOP", x:0.50, y:0.17, color:"#FFE76A" }
    ]
  },
  room_event: {
    platforms: [
      { x:0.18, y:0.66, w:0.20, h:0.035 },
      { x:0.62, y:0.51, w:0.20, h:0.035 }
    ],
    props: [
      { type:"machine", x:0.42, y:0.67, w:72, h:84 },
      { type:"pipe", x:0.16, y:0.24, w:120, h:18 },
      { type:"vent", x:0.75, y:0.20, w:52, h:30 }
    ],
    signs: [
      { text:"ERROR", x:0.50, y:0.16, color:"#FF445C" }
    ]
  },
  room_boss: {
    platforms: [
      { x:0.10, y:0.56, w:0.18, h:0.035 },
      { x:0.41, y:0.43, w:0.18, h:0.035 },
      { x:0.72, y:0.56, w:0.18, h:0.035 }
    ],
    props: [
      { type:"tank", x:0.06, y:0.67, w:72, h:90 },
      { type:"tank", x:0.82, y:0.67, w:72, h:90 },
      { type:"pipe", x:0.35, y:0.18, w:150, h:20 }
    ],
    signs: [
      { text:"PRESSURE CORE", x:0.50, y:0.14, color:"#FF315B" }
    ]
  }
};
