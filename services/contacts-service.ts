import { v4 as uuidv4 } from 'uuid';

export interface Contact {
  id: string;
  name: string;
  address: string;
  createdAt: number;
  updatedAt: number;
}

class ContactsService {
  private readonly STORAGE_KEY = 'saved_contacts';

  async getContacts(): Promise<Contact[]> {
    if (typeof window === 'undefined') return [];
    const contacts = localStorage.getItem(this.STORAGE_KEY);
    return contacts ? JSON.parse(contacts) : [];
  }

  async saveContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Contact> {
    const contacts = await this.getContacts();
    const now = Date.now();
    
    if (contact.id) {
      // Update existing contact
      const index = contacts.findIndex(c => c.id === contact.id);
      if (index >= 0) {
        const updated = {
          ...contacts[index],
          ...contact,
          updatedAt: now
        };
        contacts[index] = updated;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contacts));
        return updated;
      }
    }
    
    // Create new contact
    const newContact: Contact = {
      id: uuidv4(),
      name: contact.name.trim(),
      address: contact.address.toLowerCase(),
      createdAt: now,
      updatedAt: now
    };
    
    const updatedContacts = [...contacts, newContact];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedContacts));
    return newContact;
  }

  async deleteContact(id: string): Promise<void> {
    const contacts = await this.getContacts();
    const updated = contacts.filter(contact => contact.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  async getContactByAddress(address: string): Promise<Contact | undefined> {
    const contacts = await this.getContacts();
    return contacts.find(c => c.address.toLowerCase() === address.toLowerCase());
  }
}

export const contactsService = new ContactsService();
