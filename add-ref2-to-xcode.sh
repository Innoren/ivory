#!/bin/bash

# Script to add ref2.png to Xcode Assets catalog

echo "📦 Adding ref2.png to Xcode Assets..."

# Create the imageset directory
IMAGESET_DIR="ios/App/App/Assets.xcassets/ref2.imageset"
mkdir -p "$IMAGESET_DIR"

# Copy the image
if [ -f "public/ref2.png" ]; then
    cp "public/ref2.png" "$IMAGESET_DIR/ref2.png"
    echo "✅ Copied ref2.png to Assets"
else
    echo "❌ Error: public/ref2.png not found"
    exit 1
fi

# Create Contents.json
cat > "$IMAGESET_DIR/Contents.json" << 'EOF'
{
  "images" : [
    {
      "filename" : "ref2.png",
      "idiom" : "universal",
      "scale" : "1x"
    },
    {
      "idiom" : "universal",
      "scale" : "2x"
    },
    {
      "idiom" : "universal",
      "scale" : "3x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "✅ Created Contents.json"
echo ""
echo "🎉 ref2.png has been added to Xcode Assets!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: open ios/App/App.xcworkspace"
echo "2. The image should appear in Assets.xcassets as 'ref2'"
echo "3. Build and run the app"
echo "4. When you open the camera, you'll see the ref2.png overlay"
