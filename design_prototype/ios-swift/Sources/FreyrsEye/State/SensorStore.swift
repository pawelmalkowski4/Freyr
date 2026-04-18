import Foundation
import Combine

@MainActor
final class SensorStore: ObservableObject {
    @Published var connected = false
    @Published var deviceName: String?
    @Published var temp: Double?
    @Published var humidity: Double?
    @Published var pressure: Double?
    @Published var light: Double?
    @Published var soil: Int?
    @Published var battery: Int?
    @Published var lastUpdate: Date?

    func graceScore(for opt: Plant.Optimal) -> Int {
        func score(_ v: Double?, _ lo: Double, _ hi: Double) -> Double {
            guard let v else { return 50 }
            if v >= lo && v <= hi { return 100 }
            let dist = v < lo ? lo - v : v - hi
            let range = hi - lo
            return max(0, 100 - (dist / range) * 100)
        }
        let a = score(soil.map(Double.init), opt.soilMin, opt.soilMax)
        let b = score(light, opt.lightMin, opt.lightMax)
        let c = score(temp,  opt.tempMin,  opt.tempMax)
        return Int((a * 0.5 + b * 0.25 + c * 0.25).rounded())
    }

    var graceBand: GraceBand {
        // caller passes a plant; for header-only preview we use flax defaults
        let opt = Plant.Optimal.lenDefault
        let s = graceScore(for: opt)
        if s >= 70 { return .hoja }
        if s >= 40 { return .warn }
        return .bad
    }
}

enum GraceBand { case hoja, warn, bad }
