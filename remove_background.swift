import AppKit
import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation
import Vision

guard CommandLine.arguments.count >= 3 else {
  fputs("Usage: swift remove_background.swift <input> <output>\n", stderr)
  exit(1)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

guard
  let inputImage = NSImage(contentsOf: inputURL),
  let tiffData = inputImage.tiffRepresentation,
  let bitmap = NSBitmapImageRep(data: tiffData),
  let ciInput = CIImage(bitmapImageRep: bitmap)
else {
  fputs("Could not load input image.\n", stderr)
  exit(1)
}

let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: ciInput, options: [:])

do {
  try handler.perform([request])
} catch {
  fputs("Vision request failed: \(error)\n", stderr)
  exit(1)
}

guard let observation = request.results?.first else {
  fputs("No foreground detected.\n", stderr)
  exit(1)
}

let ciContext = CIContext()
let fullExtent = ciInput.extent

guard
  let maskPixelBuffer = try? observation.generateScaledMaskForImage(
    forInstances: observation.allInstances,
    from: handler
  )
else {
  fputs("Could not generate mask.\n", stderr)
  exit(1)
}

let maskImage = CIImage(cvPixelBuffer: maskPixelBuffer)
let resizedMask = maskImage.transformed(
  by: CGAffineTransform(
    scaleX: fullExtent.width / maskImage.extent.width,
    y: fullExtent.height / maskImage.extent.height
  )
)

let clearBackground = CIImage(color: .clear).cropped(to: fullExtent)
let blendFilter = CIFilter.blendWithMask()
blendFilter.inputImage = ciInput
blendFilter.backgroundImage = clearBackground
blendFilter.maskImage = resizedMask

guard let outputImage = blendFilter.outputImage else {
  fputs("Could not blend output image.\n", stderr)
  exit(1)
}

guard let cgImage = ciContext.createCGImage(outputImage, from: fullExtent) else {
  fputs("Could not create CGImage.\n", stderr)
  exit(1)
}

let outputRep = NSBitmapImageRep(cgImage: cgImage)
guard let pngData = outputRep.representation(using: .png, properties: [:]) else {
  fputs("Could not encode PNG.\n", stderr)
  exit(1)
}

do {
  try pngData.write(to: outputURL)
} catch {
  fputs("Could not save PNG: \(error)\n", stderr)
  exit(1)
}

print("Saved cutout to \(outputURL.path)")
