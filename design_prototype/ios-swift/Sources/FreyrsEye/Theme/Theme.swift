import SwiftUI

/// Design tokens mirrored from prototype-style.css — keep in sync.
enum Theme {
    enum Color {
        static let bg        = SwiftUI.Color(hex: 0x1a1714)
        static let stage     = SwiftUI.Color(hex: 0x2a2520)
        static let paper     = SwiftUI.Color(hex: 0xf4ecdc)
        static let paper2    = SwiftUI.Color(hex: 0xebe0c9)
        static let paper3    = SwiftUI.Color(hex: 0xe0d1b2)
        static let ink       = SwiftUI.Color(hex: 0x1e1a16)
        static let inkSoft   = SwiftUI.Color(hex: 0x5b4f40)
        static let inkFaint  = SwiftUI.Color(hex: 0x9a8870)
        static let rule      = SwiftUI.Color(hex: 0xc8b996)
        static let gold      = SwiftUI.Color(hex: 0xc4934a)
        static let goldSoft  = SwiftUI.Color(hex: 0xe3be7d)
        static let goldDeep  = SwiftUI.Color(hex: 0x8a6328)
        static let good      = SwiftUI.Color(hex: 0x6b8a4a)
        static let warn      = SwiftUI.Color(hex: 0xc48e48)
        static let bad       = SwiftUI.Color(hex: 0xa8442e)
    }

    enum Font {
        /// Add these via Info.plist → UIAppFonts
        static let serif = "CormorantGaramond-SemiBold"
        static let sans  = "Inter-Medium"
        static let mono  = "JetBrainsMono-Regular"

        static func serif(_ size: CGFloat) -> SwiftUI.Font { .custom(serif, size: size) }
        static func sans(_ size: CGFloat)  -> SwiftUI.Font { .custom(sans,  size: size) }
        static func mono(_ size: CGFloat)  -> SwiftUI.Font { .custom(mono,  size: size) }
    }

    enum Space {
        static let xs: CGFloat = 4, sm: CGFloat = 8, md: CGFloat = 12
        static let lg: CGFloat = 16, xl: CGFloat = 24, xxl: CGFloat = 32
    }

    enum Radius {
        static let sm: CGFloat = 8, md: CGFloat = 14, lg: CGFloat = 20, xl: CGFloat = 28
    }
}

extension Color {
    init(hex: UInt32, alpha: Double = 1.0) {
        self.init(
            .sRGB,
            red:   Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >>  8) & 0xff) / 255,
            blue:  Double( hex        & 0xff) / 255,
            opacity: alpha
        )
    }
}
