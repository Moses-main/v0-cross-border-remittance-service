"use client";

import { useCallback, useEffect, useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, UserPlus, Send, Trash2, Edit } from "lucide-react";
import { contactsService, Contact } from "@/services/contacts-service";
import { useToast } from "@/components/ui/use-toast";
import { useWalletState } from "@/providers/wallet-state-provider";

export default function ContactsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isConnected } = useWalletState();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Contact>>({ name: "", address: "" });

  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await contactsService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      await contactsService.deleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast({
        title: "Contact Deleted",
        description: "Contact has been removed",
      });
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSendTo = useCallback((address: string) => {
    router.push(`/transfer?to=${encodeURIComponent(address)}`);
  }, [router]);

  const startEditing = (contact: Contact) => {
    setEditingId(contact.id);
    setEditForm({ name: contact.name, address: contact.address });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ name: "", address: "" });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.name?.trim() || !editForm.address?.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and address are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await contactsService.saveContact({
        id,
        name: editForm.name,
        address: editForm.address,
      });
      await loadContacts();
      setEditingId(null);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (error) {
      console.error("Failed to update contact:", error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = useMemo(() => 
    contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.address.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [contacts, searchTerm]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Contacts</h1>
          <p className="text-muted-foreground">
            Manage your saved payment recipients
          </p>
        </div>
        <Button onClick={() => router.push("/transfer")}>
          <UserPlus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} saved
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchTerm ? 'No matching contacts found' : 'No contacts saved yet'}
              </div>
              {!searchTerm && (
                <Button onClick={() => router.push('/group-pay')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Recipients
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {editingId === contact.id ? (
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          contact.name
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {editingId === contact.id ? (
                          <Input
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="h-8 font-mono"
                          />
                        ) : (
                          `${contact.address.slice(0, 6)}...${contact.address.slice(-4)}`
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {editingId === contact.id ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => saveEdit(contact.id)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSendTo(contact.address)}
                                disabled={!isConnected}
                                title="Send Payment"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(contact)}
                                title="Edit Contact"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(contact.id)}
                                className="text-destructive hover:text-destructive"
                                title="Delete Contact"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
