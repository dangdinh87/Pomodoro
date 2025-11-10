"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Palette,
  Sliders,
  Map
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useBackground } from '@/contexts/background-context'

interface BackgroundCustomizerProps {
  onBackgroundChange?: (background: string) => void
}

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY' // User should replace this
const DEFAULT_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop',
]

export function BackgroundCustomizer({ onBackgroundChange }: BackgroundCustomizerProps) {
  const { background, setBackgroundType, setBackgroundColor, setBackgroundImage, setGradientBackground, setShowDottedMap } = useBackground()
  const [localBackgroundColor, setLocalBackgroundColor] = useState('#1a1a2e')
  const [localBackgroundImage, setLocalBackgroundImage] = useState('')
  const [imageOpacity, setImageOpacity] = useState(0.8)
  const [blurAmount, setBlurAmount] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Initialize local state from context
  useEffect(() => {
    if (background.type === 'solid') {
      setLocalBackgroundColor(background.value)
    } else if (background.type === 'image') {
      setLocalBackgroundImage(background.value)
      setImageOpacity(background.opacity)
      setBlurAmount(background.blur)
    }
  }, [background])

  useEffect(() => {
    // Apply background changes to context
    if (background.type === 'solid') {
      setBackgroundColor(localBackgroundColor)
    } else if (background.type === 'gradient') {
      setGradientBackground(localBackgroundColor)
    } else if (background.type === 'image' && localBackgroundImage) {
      setBackgroundImage(localBackgroundImage, imageOpacity, blurAmount)
    }
    
    // Also call the original onBackgroundChange if provided
    if (onBackgroundChange) {
      if (background.type === 'solid') {
        onBackgroundChange(localBackgroundColor)
      } else if (background.type === 'gradient') {
        onBackgroundChange(localBackgroundColor)
      } else if (background.type === 'image' && localBackgroundImage) {
        onBackgroundChange(`url(${localBackgroundImage})`)
      }
    }
  }, [background.type, localBackgroundColor, localBackgroundImage, imageOpacity, blurAmount, setBackgroundColor, setBackgroundImage, setGradientBackground, onBackgroundChange])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLocalBackgroundImage(result)
        setBackgroundType('image')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const getRandomImage = async () => {
    try {
      // Use a random image from our default collection
      const randomIndex = Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)
      const randomImage = DEFAULT_BACKGROUNDS[randomIndex]
      setLocalBackgroundImage(randomImage)
      setBackgroundType('image')
    } catch (error) {
      console.error('Error fetching random image:', error)
      // Fallback to a default image
      setLocalBackgroundImage(DEFAULT_BACKGROUNDS[0])
      setBackgroundType('image')
    }
  }

  const getCustomRandomImage = async () => {
    try {
      // Using Lorem Picsum for random images
      const randomSeed = Math.random().toString(36).substring(7)
      const imageUrl = `https://picsum.photos/seed/${randomSeed}/1920/1080.jpg`
      setLocalBackgroundImage(imageUrl)
      setBackgroundType('image')
    } catch (error) {
      console.error('Error fetching custom random image:', error)
      getRandomImage() // Fallback to default collection
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Background Customizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dotted Map Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="dotted-map">Show Dotted Map Background</Label>
          <Switch
            id="dotted-map"
            checked={background.showDottedMap}
            onCheckedChange={setShowDottedMap}
          />
        </div>

        {/* Background Type Toggle */}
        <div className="space-y-2">
          <Label>Background Type</Label>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={background.type === 'none' ? 'default' : 'outline'}
              onClick={() => setBackgroundType('none')}
              className="flex items-center gap-2"
            >
              None
            </Button>
            <Button
              variant={background.type === 'solid' ? 'default' : 'outline'}
              onClick={() => setBackgroundType('solid')}
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Solid
            </Button>
            <Button
              variant={background.type === 'gradient' ? 'default' : 'outline'}
              onClick={() => setBackgroundType('gradient')}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
              Gradient
            </Button>
            <Button
              variant={background.type === 'image' ? 'default' : 'outline'}
              onClick={() => setBackgroundType('image')}
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Image
            </Button>
          </div>
        </div>

        {background.type === 'solid' || background.type === 'gradient' ? (
          // Solid/Gradient Color Options
          <div className="space-y-2">
            <Label htmlFor="bg-color">
              {background.type === 'gradient' ? 'Background Gradient' : 'Background Color'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={background.type === 'gradient' ? '#667eea' : localBackgroundColor}
                onChange={(e) => setLocalBackgroundColor(background.type === 'gradient' ?
                  `linear-gradient(135deg, ${e.target.value} 0%, #764ba2 100%)` :
                  e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={localBackgroundColor}
                onChange={(e) => setLocalBackgroundColor(e.target.value)}
                placeholder={background.type === 'gradient' ?
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                  '#1a1a2e'}
                className="flex-1"
              />
            </div>
            {background.type === 'gradient' && (
              <div className="text-xs text-muted-foreground">
                Enter a CSS gradient value (e.g., linear-gradient(135deg, #667eea 0%, #764ba2 100%))
              </div>
            )}
          </div>
        ) : (
          // Image Background Options
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Custom Image</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose Image'}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Random Image Options */}
            <div className="space-y-2">
              <Label>Random Images</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={getRandomImage}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Collection
                </Button>
                <Button
                  variant="outline"
                  onClick={getCustomRandomImage}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Random Web
                </Button>
              </div>
            </div>

            {/* Image Adjustments */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <Label>Image Adjustments</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="opacity">Opacity</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(imageOpacity * 100)}%</span>
                </div>
                <Input
                  id="opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={imageOpacity}
                  onChange={(e) => setImageOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="blur">Blur</Label>
                  <span className="text-sm text-muted-foreground">{blurAmount}px</span>
                </div>
                <Input
                  id="blur"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {background.type === 'image' && localBackgroundImage && (
          <div className="mt-4">
            <Label className="text-sm text-muted-foreground">Preview</Label>
            <div
              className="mt-2 w-full h-24 rounded-md border bg-cover bg-center"
              style={{
                backgroundImage: `url(${localBackgroundImage})`,
                opacity: imageOpacity,
                filter: `blur(${blurAmount}px)`
              }}
            />
          </div>
        )}

        {/* Dotted Map Preview */}
        {background.showDottedMap && (
          <div className="mt-4">
            <Label className="text-sm text-muted-foreground">Dotted Map Background</Label>
            <div className="mt-2 w-full h-24 rounded-md border bg-muted flex items-center justify-center">
              <Map className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}