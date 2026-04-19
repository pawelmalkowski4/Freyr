// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "FreyrsEye",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "FreyrsEye", targets: ["FreyrsEye"])
    ],
    targets: [
        .target(name: "FreyrsEye", path: "Sources/FreyrsEye")
    ]
)
