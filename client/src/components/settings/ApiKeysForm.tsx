import { useState } from "react";
import { useApiKeys } from "@/hooks/useApiKeys";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiKeyFormSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ClipboardCopy, Key, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

export function ApiKeysForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [createdApiKeyState, setCreatedApiKey] = useState<any>(null);

  const {
    apiKeys,
    isLoading,
    createApiKey,
    isCreating,
    createdApiKey,
    toggleApiKeyStatus,
    isToggling,
    deleteApiKey,
    isDeleting,
  } = useApiKeys();

  const form = useForm<z.infer<typeof apiKeyFormSchema>>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      expiryDays: 30,
    },
  });
  
  // Reset form when dialog closes
  const resetForm = () => {
    form.reset({ name: "", expiryDays: 30 });
  };

  function onSubmit(values: z.infer<typeof apiKeyFormSchema>) {
    console.log("Submitting form with values:", values);
    createApiKey(values, {
      onSuccess: (data) => {
        console.log("API Key created successfully:", data);
        // Leave dialog open to show the created key
        // Form will be reset on close
      },
      onError: (error) => {
        console.error("Error creating API key:", error);
      }
    });
  }

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard.",
    });
  };

  const handleToggleStatus = (id: number, isActive: boolean) => {
    toggleApiKeyStatus({ id, isActive: !isActive });
  };

  const handleDeleteKey = (id: number) => {
    setSelectedKeyId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedKeyId !== null) {
      deleteApiKey(selectedKeyId);
      setShowDeleteDialog(false);
      setSelectedKeyId(null);
    }
  };

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "Never";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">API Keys</h3>
          <p className="text-sm text-gray-500">
            Create and manage API keys for programmatic access to the application.
          </p>
        </div>
        <Dialog 
          open={showNewKeyDialog} 
          onOpenChange={(open) => {
            setShowNewKeyDialog(open);
            if (!open) {
              resetForm();
            }
          }}>
          <DialogTrigger asChild>
            <Button>Create New API Key</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to authenticate requests to the API.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={form.getValues().name || ""}
                    onChange={(e) => form.setValue("name", e.target.value)}
                    placeholder="My API Key" 
                  />
                  <p className="text-sm text-muted-foreground">
                    A descriptive name to identify this API key.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Select
                    onValueChange={(value) => {
                      form.setValue("expiryDays", value === "never" ? null : parseInt(value))
                    }}
                    defaultValue={"30"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="never">Never expires</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    When this API key should expire. Select "Never expires" for a permanent key.
                  </p>
                </div>

                <DialogFooter>
                  <Button 
                    onClick={() => {
                      try {
                        const values = form.getValues();
                        console.log("Creating API key with values:", values);
                        
                        // Directly fetch to debug
                        fetch('/api/keys', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(values),
                          credentials: 'include'
                        })
                        .then(response => {
                          console.log("API response status:", response.status);
                          return response.json();
                        })
                        .then(data => {
                          console.log("API response data:", data);
                          if (data.apiKey) {
                            queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
                            // Set the created API key to show in the UI
                            setCreatedApiKey(data.apiKey);
                          }
                        })
                        .catch(err => {
                          console.error("Error in fetch:", err);
                        });
                      } catch (err) {
                        console.error("Error in button click handler:", err);
                      }
                    }}
                    disabled={isCreating}
                    type="button"
                  >
                    {isCreating ? "Creating..." : "Create API Key"}
                  </Button>
                </DialogFooter>
              </div>
            </Form>
            {createdApiKeyState && (
              <Alert className="mt-4">
                <Key className="h-4 w-4" />
                <AlertTitle>New API Key Created</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 mb-4">
                    <span className="text-xs text-gray-500">
                      This key will only be displayed once. Save it somewhere secure.
                    </span>
                    <div className="mt-1 flex items-center space-x-2">
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm overflow-x-auto max-w-full">
                        {createdApiKeyState.key}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyApiKey(createdApiKeyState.key)}
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewKeyDialog(false);
                      setCreatedApiKey(null);
                    }}
                  >
                    Close
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-4">Loading API keys...</div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableCaption>A list of your API keys</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={key.isActive}
                          onCheckedChange={() => handleToggleStatus(key.id, key.isActive)}
                          disabled={isToggling}
                        />
                        <Badge
                          variant={key.isActive ? "default" : "secondary"}
                        >
                          {key.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
                    <TableCell>{formatDate(key.lastUsedAt)}</TableCell>
                    <TableCell>
                      {key.expiresAt ? (
                        <span className={new Date(key.expiresAt) < new Date() ? "text-red-500" : ""}>
                          {formatDate(key.expiresAt)}
                        </span>
                      ) : (
                        "Never"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No API keys found. Create one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}