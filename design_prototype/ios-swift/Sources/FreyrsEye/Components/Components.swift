import SwiftUI

// MARK: - Card

struct Card<Content: View>: View {
    let content: Content
    init(@ViewBuilder _ content: () -> Content) { self.content = content() }
    var body: some View {
        content
            .padding(Theme.Space.lg)
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                    .fill(Theme.Color.paper)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.lg)
                    .stroke(Theme.Color.rule.opacity(0.4), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.06), radius: 12, x: 0, y: 4)
    }
}

// MARK: - SensorBar (bar with optimal range + current dot)

struct SensorBar: View {
    let label: String
    let rune: String
    let value: Double
    let unit: String
    let min: Double
    let max: Double
    let optMin: Double
    let optMax: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(rune).font(Theme.Font.serif(20)).foregroundColor(Theme.Color.goldDeep)
                Text(label).font(Theme.Font.sans(13)).foregroundColor(Theme.Color.inkSoft)
                Spacer()
                Text(String(format: "%.0f\(unit)", value))
                    .font(Theme.Font.mono(13))
                    .foregroundColor(Theme.Color.ink)
            }
            GeometryReader { geo in
                let w = geo.size.width
                let range = max - min
                let optL = CGFloat((optMin - min) / range) * w
                let optW = CGFloat((optMax - optMin) / range) * w
                let dotX = CGFloat((value.clamped(min, max) - min) / range) * w
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.Color.paper3)
                    Capsule()
                        .fill(Theme.Color.good.opacity(0.3))
                        .frame(width: optW)
                        .offset(x: optL)
                    Circle()
                        .fill(inRange ? Theme.Color.good : Theme.Color.warn)
                        .frame(width: 12, height: 12)
                        .overlay(Circle().stroke(Theme.Color.paper, lineWidth: 2))
                        .offset(x: dotX - 6)
                }
                .frame(height: 8)
            }
            .frame(height: 12)
        }
    }

    private var inRange: Bool { value >= optMin && value <= optMax }
}

extension Double {
    func clamped(_ lo: Double, _ hi: Double) -> Double { Swift.min(Swift.max(self, lo), hi) }
}

// MARK: - Chip

struct Chip: View {
    let text: String
    var body: some View {
        Text(text)
            .font(Theme.Font.mono(10))
            .tracking(1.2)
            .padding(.horizontal, 10).padding(.vertical, 5)
            .background(Capsule().fill(Theme.Color.paper2))
            .foregroundColor(Theme.Color.inkSoft)
    }
}

// MARK: - NavHead

struct NavHead: View {
    let title: String?
    let subtitle: String?
    var onBack: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .top) {
            if let onBack {
                Button(action: onBack) {
                    Text("‹").font(.system(size: 28)).foregroundColor(Theme.Color.ink)
                }
            }
            if let subtitle {
                VStack(alignment: .leading, spacing: 2) {
                    Text(subtitle).font(Theme.Font.mono(10)).tracking(1.4)
                        .foregroundColor(Theme.Color.inkFaint)
                    if let title { Text(title).font(Theme.Font.serif(30)).foregroundColor(Theme.Color.ink) }
                }
            }
            Spacer()
        }
    }
}
