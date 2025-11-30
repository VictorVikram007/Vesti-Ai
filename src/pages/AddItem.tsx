
import { useState, useRef } from "react";
import { useWardrobe } from "@/context/WardrobeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AddItem = () => {
  const { addClothingItem } = useWardrobe();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  const handleSeasonToggle = (season: string) => {
    if (selectedSeasons.includes(season)) {
      setSelectedSeasons(selectedSeasons.filter(s => s !== season));
    } else {
      setSelectedSeasons([...selectedSeasons, season]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!name.trim()) throw new Error("Item name is required");
      if (!category) throw new Error("Category is required");
      if (!color) throw new Error("Color is required");
      if (selectedSeasons.length === 0) throw new Error("Please select at least one season");
      if (!image) throw new Error("Please upload an image");

      // Convert tags string to array
      const tagsArray = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");

      // Add the item
      addClothingItem({
        name,
        category,
        color,
        season: selectedSeasons,
        image: image,
        brand: brand || undefined,
        material: material || undefined,
        description: description || undefined,
        tags: tagsArray,
      });

      // Show success toast
      toast({
        title: "Item Added",
        description: `${name} has been added to your wardrobe`,
      });

      // Navigate back to the closet
      navigate("/closet");
    } catch (error) {
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Item</h1>
        <p className="text-muted-foreground mt-1">
          Add a new clothing item to your digital wardrobe
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Blue Denim Jacket"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tops">Tops</SelectItem>
                  <SelectItem value="Bottoms">Bottoms</SelectItem>
                  <SelectItem value="Outerwear">Outerwear</SelectItem>
                  <SelectItem value="Dresses">Dresses</SelectItem>
                  <SelectItem value="Footwear">Footwear</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Select value={color} onValueChange={setColor} required>
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Black">Black</SelectItem>
                  <SelectItem value="White">White</SelectItem>
                  <SelectItem value="Gray">Gray</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                  <SelectItem value="Blue">Blue</SelectItem>
                  <SelectItem value="Green">Green</SelectItem>
                  <SelectItem value="Yellow">Yellow</SelectItem>
                  <SelectItem value="Orange">Orange</SelectItem>
                  <SelectItem value="Purple">Purple</SelectItem>
                  <SelectItem value="Pink">Pink</SelectItem>
                  <SelectItem value="Brown">Brown</SelectItem>
                  <SelectItem value="Beige">Beige</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="Levi's"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                placeholder="Cotton"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Seasons *</Label>
              <div className="flex flex-wrap gap-2">
                {["Spring", "Summer", "Fall", "Winter", "All Seasons"].map((season) => (
                  <Button
                    key={season}
                    type="button"
                    variant={selectedSeasons.includes(season) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSeasonToggle(season)}
                    className={selectedSeasons.includes(season) ? "bg-wardrobe-teal hover:bg-wardrobe-teal/90" : ""}
                  >
                    {season}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="casual, denim, favorite"
                value={tags}
                onChange={handleTagsChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a brief description of the item..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image *</Label>
              <div className="mt-1 flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {image && (
                  <span className="text-sm text-muted-foreground">
                    Image uploaded
                  </span>
                )}
              </div>
              {image && (
                <div className="mt-2 relative w-32 h-32 rounded-md overflow-hidden border">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/closet")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add to Wardrobe"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;
