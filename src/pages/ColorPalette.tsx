import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Palette, Eye, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ColorPalette = () => {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [customHex, setCustomHex] = useState('');

  const fashionColors = [
    { name: 'Classic Black', hex: '#000000', category: 'Neutral' },
    { name: 'Pure White', hex: '#FFFFFF', category: 'Neutral' },
    { name: 'Charcoal Grey', hex: '#36454F', category: 'Neutral' },
    { name: 'Navy Blue', hex: '#000080', category: 'Cool' },
    { name: 'Burgundy', hex: '#800020', category: 'Warm' },
    { name: 'Forest Green', hex: '#355E3B', category: 'Cool' },
    { name: 'Camel', hex: '#C19A6B', category: 'Warm' },
    { name: 'Cream', hex: '#F5F5DC', category: 'Neutral' },
    { name: 'Dusty Rose', hex: '#DCAE96', category: 'Warm' },
    { name: 'Sage Green', hex: '#9CAF88', category: 'Cool' },
    { name: 'Terracotta', hex: '#E2725B', category: 'Warm' },
    { name: 'Powder Blue', hex: '#B0E0E6', category: 'Cool' },
    { name: 'Mustard Yellow', hex: '#FFDB58', category: 'Warm' },
    { name: 'Lavender', hex: '#E6E6FA', category: 'Cool' },
    { name: 'Coral', hex: '#FF7F50', category: 'Warm' },
    { name: 'Olive', hex: '#808000', category: 'Warm' },
    { name: 'Blush Pink', hex: '#FFC0CB', category: 'Warm' },
    { name: 'Steel Blue', hex: '#4682B4', category: 'Cool' },
    { name: 'Chocolate Brown', hex: '#7B3F00', category: 'Warm' },
    { name: 'Mint Green', hex: '#98FB98', category: 'Cool' },
    { name: 'Slate Grey', hex: '#708090', category: 'Neutral' },
    { name: 'Crimson Red', hex: '#DC143C', category: 'Warm' },
    { name: 'Teal', hex: '#008080', category: 'Cool' },
    { name: 'Beige', hex: '#F5F5DC', category: 'Neutral' },
    { name: 'Plum Purple', hex: '#8E4585', category: 'Cool' },
    { name: 'Burnt Orange', hex: '#CC5500', category: 'Warm' },
    { name: 'Ivory', hex: '#FFFFF0', category: 'Neutral' },
    { name: 'Emerald Green', hex: '#50C878', category: 'Cool' },
    { name: 'Rose Gold', hex: '#E8B4B8', category: 'Warm' },
    { name: 'Periwinkle', hex: '#CCCCFF', category: 'Cool' },
    { name: 'Taupe', hex: '#483C32', category: 'Neutral' },
    { name: 'Magenta', hex: '#FF00FF', category: 'Warm' },
    { name: 'Aqua', hex: '#00FFFF', category: 'Cool' },
    { name: 'Sand', hex: '#C2B280', category: 'Neutral' },
    { name: 'Violet', hex: '#8A2BE2', category: 'Cool' },
    { name: 'Rust', hex: '#B7410E', category: 'Warm' },
    { name: 'Pearl', hex: '#EAE0C8', category: 'Neutral' },
    { name: 'Turquoise', hex: '#40E0D0', category: 'Cool' },
    { name: 'Copper', hex: '#B87333', category: 'Warm' },
    { name: 'Silver', hex: '#C0C0C0', category: 'Neutral' },
    { name: 'Indigo', hex: '#4B0082', category: 'Cool' },
    { name: 'Amber', hex: '#FFBF00', category: 'Warm' },
    { name: 'Ash Grey', hex: '#B2BEB5', category: 'Neutral' },
    { name: 'Cerulean', hex: '#007BA7', category: 'Cool' },
    { name: 'Sienna', hex: '#A0522D', category: 'Warm' },
    { name: 'Platinum', hex: '#E5E4E2', category: 'Neutral' },
    { name: 'Cobalt Blue', hex: '#0047AB', category: 'Cool' },
    { name: 'Mahogany', hex: '#C04000', category: 'Warm' },
    { name: 'Champagne', hex: '#F7E7CE', category: 'Neutral' },
    { name: 'Peacock Blue', hex: '#005F69', category: 'Cool' }
  ];

  const colorCombinations = [
    {
      name: 'Classic Monochrome',
      colors: ['#000000', '#FFFFFF', '#808080'],
      description: 'Timeless black, white, and grey combination'
    },
    {
      name: 'Navy & Neutrals',
      colors: ['#000080', '#F5F5DC', '#C19A6B'],
      description: 'Sophisticated navy with cream and camel'
    },
    {
      name: 'Earth Tones',
      colors: ['#7B3F00', '#C19A6B', '#F5F5DC'],
      description: 'Warm chocolate, camel, and cream palette'
    },
    {
      name: 'Dusty Pastels',
      colors: ['#DCAE96', '#9CAF88', '#E6E6FA'],
      description: 'Soft dusty rose, sage, and lavender'
    },
    {
      name: 'Bold Contrast',
      colors: ['#000000', '#FF7F50', '#FFFFFF'],
      description: 'Striking black, coral, and white'
    },
    {
      name: 'Ocean Blues',
      colors: ['#000080', '#4682B4', '#B0E0E6'],
      description: 'Navy, steel blue, and powder blue gradient'
    },
    {
      name: 'Autumn Warmth',
      colors: ['#800020', '#E2725B', '#FFDB58'],
      description: 'Burgundy, terracotta, and mustard'
    },
    {
      name: 'Fresh Greens',
      colors: ['#355E3B', '#9CAF88', '#98FB98'],
      description: 'Forest green, sage, and mint combination'
    }
  ];

  const generateComplementary = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
  };

  const generateAnalogous = (hex: string) => {
    const hsl = hexToHsl(hex);
    const analogous1 = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
    const analogous2 = hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
    return [analogous1, analogous2];
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    h /= 360; s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${text} copied to clipboard` });
  };

  const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const complementary = generateComplementary(selectedColor);
  const analogous = generateAnalogous(selectedColor);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-6 w-6 text-purple-600" />
            Color Palette Studio
          </h1>
          <p className="text-muted-foreground">Explore fashion colors and create perfect combinations</p>
        </div>
      </div>

      <Tabs defaultValue="explore" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="explore">Explore Colors</TabsTrigger>
          <TabsTrigger value="combinations">Color Combinations</TabsTrigger>
          <TabsTrigger value="generator">Color Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {fashionColors.map((color) => (
              <Card 
                key={color.hex} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedColor(color.hex)}
              >
                <CardContent className="p-3">
                  <div 
                    className="w-full h-20 rounded-lg mb-3 border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">{color.name}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{color.category}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(color.hex);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{color.hex}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="combinations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colorCombinations.map((combo, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{combo.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{combo.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex rounded-lg overflow-hidden h-20">
                      {combo.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="flex-1 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: color }}
                          onClick={() => copyToClipboard(color)}
                          title={`Click to copy ${color}`}
                        >
                          <span 
                            className="text-xs font-mono font-bold"
                            style={{ color: getTextColor(color) }}
                          >
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {combo.colors.map((color, colorIndex) => (
                        <Badge 
                          key={colorIndex} 
                          variant="outline" 
                          className="font-mono text-xs cursor-pointer"
                          onClick={() => copyToClipboard(color)}
                        >
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Picker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Base Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-16 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      placeholder="Enter hex code"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && /^#[0-9A-F]{6}$/i.test(customHex)) {
                          setSelectedColor(customHex);
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (/^#[0-9A-F]{6}$/i.test(customHex)) {
                          setSelectedColor(customHex);
                        }
                      }}
                      disabled={!/^#[0-9A-F]{6}$/i.test(customHex)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div 
                    className="w-full h-24 rounded-lg border flex items-center justify-center"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <span 
                      className="font-mono font-bold"
                      style={{ color: getTextColor(selectedColor) }}
                    >
                      {selectedColor}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(selectedColor)}
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Hex Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Combinations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Complementary</h4>
                    <div className="flex rounded-lg overflow-hidden h-16">
                      <div
                        className="flex-1 flex items-center justify-center cursor-pointer"
                        style={{ backgroundColor: selectedColor }}
                        onClick={() => copyToClipboard(selectedColor)}
                      >
                        <span style={{ color: getTextColor(selectedColor) }} className="text-xs font-mono">
                          {selectedColor}
                        </span>
                      </div>
                      <div
                        className="flex-1 flex items-center justify-center cursor-pointer"
                        style={{ backgroundColor: complementary }}
                        onClick={() => copyToClipboard(complementary)}
                      >
                        <span style={{ color: getTextColor(complementary) }} className="text-xs font-mono">
                          {complementary}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Analogous</h4>
                    <div className="flex rounded-lg overflow-hidden h-16">
                      {[analogous[0], selectedColor, analogous[1]].map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 flex items-center justify-center cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => copyToClipboard(color)}
                        >
                          <span style={{ color: getTextColor(color) }} className="text-xs font-mono">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Monochromatic</h4>
                    <div className="flex rounded-lg overflow-hidden h-16">
                      {[0.3, 0.6, 1].map((opacity, index) => {
                        const rgb = selectedColor.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
                        const color = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
                        return (
                          <div
                            key={index}
                            className="flex-1 flex items-center justify-center cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => copyToClipboard(selectedColor)}
                          >
                            <span style={{ color: getTextColor(selectedColor) }} className="text-xs font-mono">
                              {Math.round(opacity * 100)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ColorPalette;