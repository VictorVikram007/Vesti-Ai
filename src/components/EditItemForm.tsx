import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ClothingItem } from '@/context/WardrobeContext';

interface EditItemFormProps {
  item: ClothingItem;
  onSave: (itemId: string, updatedData: Partial<ClothingItem>) => void;
  onCancel: () => void;
}

export const EditItemForm: React.FC<EditItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    color: item.color,
    brand: item.brand || '',
    material: item.material || '',
    description: item.description || '',
    price: item.price || 0,
    season: item.season,
    tags: item.tags.join(', '),
    isFavorite: item.isFavorite
  });

  const categories = ['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Dresses', 'Accessories'];
  const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Pink', 'Brown', 'Grey', 'Navy', 'Beige'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Seasons'];

  const handleSeasonChange = (season: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      season: checked 
        ? [...prev.season, season]
        : prev.season.filter(s => s !== season)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      price: Number(formData.price)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Color</Label>
          <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colors.map(color => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <Label>Seasons</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {seasons.map(season => (
            <label key={season} className="flex items-center gap-2">
              <Checkbox
                checked={formData.season.includes(season)}
                onCheckedChange={(checked) => handleSeasonChange(season, !!checked)}
              />
              <span className="text-sm">{season}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="casual, formal, summer"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="favorite"
          checked={formData.isFavorite}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFavorite: !!checked }))}
        />
        <Label htmlFor="favorite">Mark as favorite</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Save Changes</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
};