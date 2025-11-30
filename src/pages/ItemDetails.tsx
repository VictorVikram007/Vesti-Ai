
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWardrobe } from "@/context/WardrobeContext";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getClothingItem, updateClothingItem, removeClothingItem, getSimilarItems, outfits } = useWardrobe();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const item = getClothingItem(id || "");
  const similarItems = getSimilarItems(id || "");
  
  // Find outfits that include this item
  const itemOutfits = outfits.filter(outfit => 
    outfit.items.includes(id || "")
  );
  
  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The clothing item you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/closet")}>
          Back to Closet
        </Button>
      </div>
    );
  }
  
  const handleWorn = () => {
    updateClothingItem(item.id, { lastWorn: new Date() });
    toast({
      title: "Updated",
      description: `Marked ${item.name} as worn today.`,
    });
  };
  
  const handleDelete = () => {
    removeClothingItem(item.id);
    toast({
      title: "Item Deleted",
      description: `${item.name} has been removed from your wardrobe.`,
    });
    navigate("/closet");
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-2 h-4 w-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card border rounded-lg overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-[400px] object-cover object-center"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">{item.brand}</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-muted-foreground">Category</div>
              <div>{item.category}</div>
              
              <div className="text-muted-foreground">Color</div>
              <div className="flex items-center gap-2">
                <span>{item.color}</span>
                <span 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color.toLowerCase() }}
                ></span>
              </div>
              
              <div className="text-muted-foreground">Material</div>
              <div>{item.material || "Not specified"}</div>
              
              <div className="text-muted-foreground">Season</div>
              <div>{item.season.join(", ")}</div>
              
              <div className="text-muted-foreground">Added</div>
              <div>{format(new Date(item.addedAt), "MMM d, yyyy")}</div>
              
              {item.lastWorn && (
                <>
                  <div className="text-muted-foreground">Last Worn</div>
                  <div>{format(new Date(item.lastWorn), "MMM d, yyyy")}</div>
                </>
              )}
            </div>
            
            {item.description && (
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            )}
            
            {item.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="bg-muted px-2 py-1 rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              onClick={handleWorn}
              className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2 h-4 w-4"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Mark as Worn Today
            </Button>
            <Button variant="outline" onClick={() => navigate(`/edit-item/${item.id}`)}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2 h-4 w-4"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2 h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      {itemOutfits.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Included in {itemOutfits.length} Outfits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {itemOutfits.map((outfit) => (
              <div 
                key={outfit.id}
                className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/outfits?selected=${outfit.id}`)}
              >
                <div className="p-4">
                  <h3 className="font-medium">{outfit.name}</h3>
                  <p className="text-sm text-muted-foreground">{outfit.occasion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {similarItems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Similar Items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarItems.map((similarItem) => (
              <div 
                key={similarItem.id}
                className="wardrobe-item cursor-pointer"
                onClick={() => navigate(`/item/${similarItem.id}`)}
              >
                <div>
                  <img 
                    src={similarItem.image} 
                    alt={similarItem.name}
                    className="wardrobe-item-image"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{similarItem.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{similarItem.category}</span>
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: similarItem.color.toLowerCase() }}
                      title={similarItem.color}
                    ></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
              {itemOutfits.length > 0 && (
                <div className="mt-2 text-destructive">
                  This item is used in {itemOutfits.length} outfit(s). Deleting it will remove it from those outfits.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemDetails;
