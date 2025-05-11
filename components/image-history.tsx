"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Download, 
  Trash2, 
  Info, 
  Image as ImageIcon, 
  Calendar, 
  Sparkles,
  Maximize
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

// Define the type for image generation
interface ImageGeneration {
  id: string;
  prompt: string;
  imageUrl: string;
  resolution: string;
  model: string;
  createdAt: string;
  metadata: {
    style: string;
    enhancedPrompt?: string;
    generationParams?: {
      temperature?: number;
      topK?: number;
      topP?: number;
    }
  };
}

interface ImageHistoryProps {
  limit?: number;
  showPagination?: boolean;
  showActions?: boolean;
}

export function ImageHistory({ 
  limit = 6, 
  showPagination = true,
  showActions = true 
}: ImageHistoryProps) {
  const [images, setImages] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState<ImageGeneration | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [fullImageDialogOpen, setFullImageDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/images?page=${page}&limit=${limit}`);
      
      setImages(response.data.images);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("Failed to load images. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchImages();
  }, [page, limit]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/images/${id}`);
      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted.",
        variant: "default",
      });
      setDeleteDialogOpen(false);
      fetchImages(); // Refresh the list
    } catch (err) {
      console.error("Error deleting image:", err);
      toast({
        title: "Error",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle download
  const handleDownload = (imageUrl: string, prompt: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = imageUrl;
    // Create a filename based on the prompt (sanitized)
    const filename = prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your image is being downloaded.",
      variant: "default",
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchImages} className="mt-4">Try Again</Button>
      </div>
    );
  }

  if (loading && images.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (images.length === 0 && !loading) {
    return (
      <div className="text-center py-10">
        <ImageIcon className="h-16 w-16 mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-medium">No images yet</h3>
        <p className="mt-1 text-gray-500">Generate some images to see your history.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative aspect-square group">
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="object-cover w-full h-full transition-opacity group-hover:opacity-90"
              />
              {showActions && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedImage(image);
                      setFullImageDialogOpen(true);
                    }}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(image.imageUrl, image.prompt)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedImage(image);
                      setInfoDialogOpen(true);
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedImage(image);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <CardFooter className="p-2 flex-col items-start">
              <p className="text-sm text-gray-700 line-clamp-2">
                {image.prompt}
              </p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(image.createdAt)}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={page === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => handlePageChange(i + 1)}
                  isActive={page === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={page === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="my-2">
            {selectedImage && (
              <img
                src={selectedImage.imageUrl}
                alt="Preview"
                className="max-h-40 rounded mx-auto object-contain"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedImage && handleDelete(selectedImage.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="grid grid-cols-1 gap-4">
              <div className="aspect-square max-h-[300px] overflow-hidden rounded-md">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.prompt}
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Original Prompt</h3>
                  <p className="text-sm mt-1">{selectedImage.prompt}</p>
                </div>
                
                {selectedImage.metadata?.enhancedPrompt && (
                  <div>
                    <h3 className="text-sm font-medium flex items-center">
                      <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                      Enhanced Prompt
                    </h3>
                    <p className="text-sm mt-1">{selectedImage.metadata.enhancedPrompt}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h3 className="text-sm font-medium">Model</h3>
                    <p className="text-sm mt-1">{selectedImage.model}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Style</h3>
                    <p className="text-sm mt-1">{selectedImage.metadata?.style || "Standard"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Resolution</h3>
                    <p className="text-sm mt-1">{selectedImage.resolution || "Default"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Created At</h3>
                    <p className="text-sm mt-1">{formatDate(selectedImage.createdAt)}</p>
                  </div>
                </div>
                
                {selectedImage.metadata?.generationParams && (
                  <div>
                    <h3 className="text-sm font-medium">Generation Parameters</h3>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {selectedImage.metadata.generationParams.temperature && (
                        <div className="text-xs">
                          <span className="font-medium">Temperature:</span>{" "}
                          {selectedImage.metadata.generationParams.temperature}
                        </div>
                      )}
                      {selectedImage.metadata.generationParams.topK && (
                        <div className="text-xs">
                          <span className="font-medium">Top K:</span>{" "}
                          {selectedImage.metadata.generationParams.topK}
                        </div>
                      )}
                      {selectedImage.metadata.generationParams.topP && (
                        <div className="text-xs">
                          <span className="font-medium">Top P:</span>{" "}
                          {selectedImage.metadata.generationParams.topP}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => selectedImage && handleDownload(selectedImage.imageUrl, selectedImage.prompt)}
              className="mr-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Image Dialog */}
      <Dialog open={fullImageDialogOpen} onOpenChange={setFullImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Full Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col items-center">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                className="max-w-full max-h-[70vh] object-contain"
              />
              <p className="mt-4 text-sm text-center">{selectedImage.prompt}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => selectedImage && handleDownload(selectedImage.imageUrl, selectedImage.prompt)}
              className="mr-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={() => setFullImageDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}