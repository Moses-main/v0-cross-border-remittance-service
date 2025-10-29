"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, Save, UserPlus, ChevronDown } from "lucide-react";
import { useI18n } from "./language-provider";
import { useWalletState } from "@/providers/wallet-state-provider";
import { useToast } from "@/components/ui/use-toast";
import { contactsService, Contact } from "@/services/contacts-service";
import { remittanceService } from "@/services/remittance-service";
import { formatUnits } from "viem";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Recipient extends Omit<Contact, 'createdAt' | 'updatedAt'> {
  id: string;
  address: string;
  amount: string;
  saveContact: boolean;
}

export function GroupPayForm() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const { address, isConnected } = useWalletState();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [totalAmount, setTotalAmount] = useState<string>("0");
  const [savedContacts, setSavedContacts] = useState<Contact[]>([]);
  const [showContactDropdown, setShowContactDropdown] = useState<string | null>(null);
  
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: crypto.randomUUID(), name: "", address: "", amount: "", saveContact: false },
  ]);

  // Load saved contacts
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoadingContacts(true);
      try {
        const contacts = await contactsService.getContacts();
        setSavedContacts(contacts);
      } catch (error) {
        console.error("Failed to load contacts:", error);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    
    loadContacts();
  }, []);

  // Calculate total amount
  useEffect(() => {
    const total = recipients.reduce((sum, recipient) => {
      return sum + (parseFloat(recipient.amount) || 0);
    }, 0);
    setTotalAmount(total.toFixed(6));
  }, [recipients]);

  // Fetch balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !address) return;
      
      try {
        const balance = await remittanceService.getUSDCBalance(address as `0x${string}`);
        setBalance(formatUnits(balance, 6));
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast({
          title: "Error",
          description: "Failed to fetch token balance",
          variant: "destructive",
        });
      }
    };

    fetchBalance();
  }, [address, isConnected, toast]);

  const handleAddRecipient = () => {
    setRecipients([...recipients, { 
      id: crypto.randomUUID(), 
      name: "", 
      address: "", 
      amount: "",
      saveContact: false 
    }]);
  };

  const handleRemoveRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id));
    }
  };

  const handleRecipientChange = (id: string, field: keyof Recipient, value: string | boolean) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSelectContact = async (recipientId: string, contact: Contact) => {
    setRecipients(
      recipients.map(r => 
        r.id === recipientId 
          ? { ...r, name: contact.name, address: contact.address }
          : r
      )
    );
    setShowContactDropdown(null);
  };

  const handleSaveContact = async (recipient: Recipient) => {
    if (!recipient.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name to save this contact",
        variant: "destructive",
      });
      return;
    }

    try {
      await contactsService.saveContact({
        id: recipient.id,
        name: recipient.name,
        address: recipient.address,
      });
      
      // Update saved contacts list
      const updatedContacts = await contactsService.getContacts();
      setSavedContacts(updatedContacts);
      
      toast({
        title: "Contact Saved",
        description: `${recipient.name} has been added to your contacts`,
      });
    } catch (error) {
      console.error("Error saving contact:", error);
      toast({
        title: "Error",
        description: "Failed to save contact",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    // Validate inputs
    const validRecipients = recipients.filter(r => r.address && r.amount);
    if (validRecipients.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one recipient with valid details",
        variant: "destructive",
      });
      return;
    }

    // Check if balance is sufficient
    if (parseFloat(totalAmount) > parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${totalAmount} USDC but only have ${balance} USDC`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save contacts if requested
      const savePromises = recipients
        .filter(r => r.saveContact && r.name && r.address)
        .map(recipient => 
          contactsService.saveContact({
            name: recipient.name || `Recipient ${recipient.address.slice(0, 6)}...`,
            address: recipient.address,
          })
        );
      
      await Promise.all(savePromises);
      
      // Execute the payment
      const result = await remittanceService.executeGroupPayment(
        address as `0x${string}`,
        validRecipients.map(r => ({
          address: r.address as `0x${string}`,
          amount: r.amount
        }))
      );
      
      toast({
        title: "Success",
        description: `Payment sent successfully!`,
      });
      
      // Reset form but keep the first recipient
      setRecipients([{ 
        id: crypto.randomUUID(), 
        name: "", 
        address: "", 
        amount: "",
        saveContact: false 
      }]);
      
    } catch (error: any) {
      console.error("Error processing payment:", error);
      
      let errorMessage = error.message || "There was an error processing your payment";
      
      if (error.message?.includes('user rejected')) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = "Insufficient funds for gas + value";
      } else if (error.message?.includes('execution reverted')) {
        errorMessage = "Transaction reverted by the contract";
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToIndividual = (recipient: Recipient) => {
    if (recipient.address) {
      router.push(`/transfer?to=${encodeURIComponent(recipient.address)}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Group Payment</h2>
        <p className="text-muted-foreground">
          Send payments to multiple recipients in one transaction
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Group Payment</CardTitle>
          <CardDescription>
            {isConnected 
              ? `Available Balance: ${parseFloat(balance).toLocaleString()} USDC`
              : 'Connect your wallet to see your balance'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="space-y-3 p-4 border rounded-lg bg-muted/10">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Recipient {recipients.indexOf(recipient) + 1}</h4>
                    {recipients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRecipient(recipient.id)}
                        className="h-8 w-8 text-destructive"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${recipient.id}`} className="text-xs">
                        Name (optional)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`name-${recipient.id}`}
                          value={recipient.name}
                          onChange={(e) =>
                            handleRecipientChange(recipient.id, "name", e.target.value)
                          }
                          placeholder="John Doe"
                          className="font-medium"
                          disabled={isLoading}
                        />
                        {savedContacts.length > 0 && (
                          <DropdownMenu 
                            open={showContactDropdown === recipient.id}
                            onOpenChange={(open) => setShowContactDropdown(open ? recipient.id : null)}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="outline" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 max-h-60 overflow-y-auto">
                              {savedContacts.map((contact) => (
                                <DropdownMenuItem 
                                  key={contact.id}
                                  onSelect={() => handleSelectContact(recipient.id, contact)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{contact.name}</span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {contact.address.slice(0, 6)}...{contact.address.slice(-4)}
                                    </span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`address-${recipient.id}`} className="text-xs">
                        Wallet Address
                      </Label>
                      <Input
                        id={`address-${recipient.id}`}
                        value={recipient.address}
                        onChange={(e) =>
                          handleRecipientChange(recipient.id, "address", e.target.value)
                        }
                        placeholder="0x..."
                        className="font-mono text-sm"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`amount-${recipient.id}`} className="text-xs">
                        Amount (USDC)
                      </Label>
                      <div className="relative">
                        <Input
                          id={`amount-${recipient.id}`}
                          type="number"
                          step="0.000001"
                          min="0"
                          value={recipient.amount}
                          onChange={(e) =>
                            handleRecipientChange(recipient.id, "amount", e.target.value)
                          }
                          placeholder="0.00"
                          className="pl-3 pr-8"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex items-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendToIndividual(recipient)}
                        disabled={!recipient.address || isLoading}
                        className="flex-1"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Send Individually
                      </Button>
                      
                      {recipient.address && !recipient.name && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecipientChange(recipient.id, 'saveContact', true)}
                          disabled={isLoading}
                          className={recipient.saveContact ? "bg-primary/10" : ""}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {recipient.saveContact ? "Will Save" : "Save Contact"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRecipient}
                disabled={isLoading || recipients.length >= 10}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient {recipients.length > 0 ? `(${recipients.length}/10)` : ''}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="text-sm">
                <span className="text-muted-foreground">Total Amount:</span>{" "}
                <span className="font-bold text-lg">{totalAmount} USDC</span>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/transfer')}
                  className="flex-1 sm:flex-none"
                >
                  Go to Single Transfer
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !isConnected} 
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Send to ${recipients.length} ${recipients.length === 1 ? 'Recipient' : 'Recipients'}`
                  )}
                </Button>
              </div>
            </div>

            {!isConnected && (
              <Alert>
                <AlertDescription className="text-center">
                  Please connect your wallet to continue
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
