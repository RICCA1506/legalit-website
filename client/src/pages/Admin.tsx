import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { NewsArticle, PartnerInvite, Professional, NewsCategory, NewsletterSubscriber, ContactMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowLeft, Newspaper, UserPlus, Mail, Copy, Check, Clock, Loader2, Users, FolderTree, MailPlus, Download, BarChart3, ChevronDown, MessageSquare, Eye, EyeOff, Phone, ExternalLink, Calendar, User, FileText, Shield, Smartphone, Move, ArrowUp, ArrowDown, ZoomIn, Link2, Maximize, X, Camera, Upload } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link, useLocation } from "wouter";
import PageHeader from "@/components/PageHeader";
import { ImageUpload } from "@/components/ImageUpload";
import ImageCropEditor from "@/components/ImageCropEditor";
import { FileUpload } from "@/components/FileUpload";
import { offices as officesData, practiceAreas } from "@/lib/data";
import { practiceAreasEnhanced, getPracticeAreaBySpecId } from "@/lib/practiceAreasData";
import { Checkbox } from "@/components/ui/checkbox";
import { SiLinkedin } from "react-icons/si";

const newsTypes = [
  { key: "studio", it: "News dello Studio", en: "Firm News" },
];

interface ArticleForm {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  newsType: string;
  authorName: string;
  linkedProfessionalId: string;
  linkedProfessionalIds: string[];
  linkedPracticeArea: string;
  linkedinUrl: string;
  linkedinSummary: string;
  imageUrl: string;
  imagePosition: string;
  imageZoom: number;
  documentUrl: string;
  documentName: string;
  readTime: string;
}

const emptyForm: ArticleForm = {
  title: "",
  content: "",
  excerpt: "",
  category: "",
  newsType: "studio",
  authorName: "",
  linkedProfessionalId: "",
  linkedProfessionalIds: [],
  linkedPracticeArea: "",
  linkedinUrl: "",
  linkedinSummary: "",
  imageUrl: "",
  imagePosition: "50,50",
  imageZoom: 100,
  documentUrl: "",
  documentName: "",
  readTime: "5 min",
};

const offices = officesData.map(o => o.city);
const titles = ["Managing Partner", "Partner", "Of Counsel", "Senior Associate", "Associate", "Trainee"];

interface ProfessionalForm {
  name: string;
  title: string;
  specializations: string[];
  office: string;
  email: string;
  phone: string;
  fullBio: string;
  education: string[];
  languages: string[];
  imageUrl: string;
  imagePosition: string;
  imageZoom: number;
}

const emptyProfessionalForm: ProfessionalForm = {
  name: "",
  title: "",
  specializations: [],
  office: "",
  email: "",
  phone: "",
  fullBio: "",
  education: [],
  languages: [],
  imageUrl: "",
  imagePosition: "center",
  imageZoom: 100,
};

const isLogoPlaceholderCheck = (imageUrl: string): boolean => {
  return imageUrl.includes('000_LOGO_LEGALIT') || imageUrl.includes('logo_legalit_cropped');
};

const getImageCropStyle = (position?: string | null, zoom?: number | null): React.CSSProperties => {
  const z = zoom || 100;
  let ox = 50, oy = 50;
  if (position && position.includes(",")) {
    const [x, y] = position.split(",").map(Number);
    if (!isNaN(x)) ox = x;
    if (!isNaN(y)) oy = y;
  } else if (position === "top") {
    oy = 15;
  } else if (position === "bottom") {
    oy = 85;
  }
  if (z === 100 && ox === 50 && oy === 50) return { objectPosition: "center" };
  return {
    objectPosition: `${ox}% ${oy}%`,
    transform: `scale(${z / 100})`,
    transformOrigin: `${ox}% ${oy}%`,
  };
};


function CardQuickUpload({ professionalId, professionalName }: { professionalId: number; professionalName: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "File non valido", description: "Seleziona un file immagine.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload-file", { method: "POST", body: formData, credentials: "include" });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();
      await apiRequest("PATCH", `/api/professionals/${professionalId}`, { imageUrl: url });
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({ title: "Foto caricata", description: `Foto aggiornata per ${professionalName}.` });
    } catch {
      toast({ title: "Errore", description: "Impossibile caricare la foto.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors border-b",
        isDragging ? "bg-primary/10" : "bg-muted/40 hover:bg-muted/70",
        isUploading && "pointer-events-none opacity-60"
      )}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files[0]); }}
      onClick={() => fileInputRef.current?.click()}
      data-testid={`dropzone-quick-upload-${professionalId}`}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
      {isUploading ? (
        <>
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </>
      ) : (
        <>
          <div className="rounded-full bg-muted p-3">
            {isDragging ? <Upload className="h-6 w-6 text-primary" /> : <Camera className="h-6 w-6 text-muted-foreground" />}
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {isDragging ? "Rilascia qui" : "Trascina o clicca"}
          </p>
          <p className="text-xs text-muted-foreground">per aggiungere foto</p>
        </>
      )}
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language } = useLanguage();

  const sortedPracticeAreas = useMemo(() => 
    [...practiceAreasEnhanced].sort((a, b) => a.titleIT.localeCompare(b.titleIT, "it")),
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [linkedinImportUrl, setLinkedinImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [lastCreatedInviteUrl, setLastCreatedInviteUrl] = useState<string | null>(null);
  const [lastCreatedInviteEmail, setLastCreatedInviteEmail] = useState<string | null>(null);
  
  // Professional state
  const [isProfessionalDialogOpen, setIsProfessionalDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalForm, setProfessionalForm] = useState<ProfessionalForm>(emptyProfessionalForm);
  const [deleteProfessionalConfirm, setDeleteProfessionalConfirm] = useState<number | null>(null);
  const [educationInput, setEducationInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const { data: articles = [], isLoading: articlesLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
    enabled: isAuthenticated,
  });

  const { data: invites = [], isLoading: invitesLoading } = useQuery<PartnerInvite[]>({
    queryKey: ["/api/invites"],
    enabled: isAuthenticated,
  });

  const { data: professionals = [], isLoading: professionalsLoading } = useQuery<Professional[]>({
    queryKey: ["/api/professionals"],
    enabled: isAuthenticated,
  });

  const { data: dbCategories = [], isLoading: categoriesLoading } = useQuery<NewsCategory[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/newsletter/subscribers"],
    enabled: isAuthenticated,
  });

  // Contact messages query
  const { data: contactMessages = [], isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact"],
    enabled: isAuthenticated,
  });

  const unreadMessagesCount = contactMessages.filter(m => m.isRead !== "true").length;

  // Mark message as read mutation
  const markMessageReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/contact/${id}/read`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/contact/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({ title: "Messaggio eliminato", description: "Il messaggio è stato eliminato con successo." });
    },
  });

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteMessageConfirm, setDeleteMessageConfirm] = useState<number | null>(null);

  interface ChatConvSummary {
    id: number;
    sessionId: string;
    ipAddress: string | null;
    messages: { role: string; text: string; timestamp: string }[];
    messageCount: number | null;
    createdAt: string | null;
    updatedAt: string | null;
  }
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ChatConvSummary[]>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });
  const [selectedConversation, setSelectedConversation] = useState<ChatConvSummary | null>(null);

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/conversations/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(null);
      toast({ title: "Conversazione eliminata" });
    },
  });

  // Users query for password reset
  interface AdminUser {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string | null;
    createdAt: Date | null;
  }
  const { data: adminUsers = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated,
  });
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null);
  
  // Check if current user is superadmin
  const isSuperAdmin = user?.role === 'superadmin';

  // 2FA Security States
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  // 2FA Setup mutation
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/2fa/setup", {});
      return res.json();
    },
    onSuccess: (data) => {
      setTwoFactorSetup({ secret: data.secret, qrCodeUrl: data.qrCodeUrl });
    },
    onError: (error: any) => {
      toast({ title: "Errore", description: error.message || "Errore durante la configurazione 2FA", variant: "destructive" });
    },
  });

  // 2FA Enable mutation
  const enable2FAMutation = useMutation({
    mutationFn: async (data: { secret: string; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/2fa/enable", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "2FA Attivato", description: "L'autenticazione a due fattori è stata attivata con successo." });
      setTwoFactorSetup(null);
      setTwoFactorCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({ title: "Errore", description: error.message || "Codice non valido", variant: "destructive" });
    },
  });

  // 2FA Disable mutation
  const disable2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/auth/2fa/disable", { code });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "2FA Disattivato", description: "L'autenticazione a due fattori è stata disattivata." });
      setDisableCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({ title: "Errore", description: error.message || "Codice non valido", variant: "destructive" });
    },
  });

  interface AdminStats {
    totals: {
      articles: number;
      professionals: number;
      categories: number;
      subscribers: number;
      users: number;
    };
    articles: {
      studio: number;
      legal: number;
      published: number;
      draft: number;
      lastMonth: number;
    };
    categories: {
      macro: number;
      micro: number;
    };
    newsletter: {
      active: number;
      total: number;
      lastMonth: number;
    };
  }

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  // Category state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", nameEn: "", type: "micro", parentCategory: "" });
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<number | null>(null);

  const macroCategories = dbCategories.filter(c => c.type === "macro");
  const microCategories = dbCategories.filter(c => c.type === "micro");

  // Category mutations
  const seedCategoriesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/categories/seed", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Categorie caricate", description: `${data.count} categorie inserite con successo.` });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Info", description: error.message || "Categorie già presenti.", variant: "default" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof categoryForm) => {
      await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Categoria creata", description: "La categoria è stata aggiunta." });
      closeCategoryDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile creare la categoria.", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof categoryForm }) => {
      await apiRequest("PATCH", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Categoria aggiornata", description: "Le modifiche sono state salvate." });
      closeCategoryDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile aggiornare la categoria.", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Categoria eliminata", description: "La categoria è stata rimossa." });
      setDeleteCategoryConfirm(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile eliminare la categoria.", variant: "destructive" });
    },
  });

  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", nameEn: "", type: "micro", parentCategory: "" });
    setIsCategoryDialogOpen(true);
  };

  const openEditCategory = (category: NewsCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      nameEn: category.nameEn || "",
      type: category.type,
      parentCategory: category.parentCategory || "",
    });
    setIsCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", nameEn: "", type: "micro", parentCategory: "" });
  };

  const handleCategorySubmit = () => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(s => !s.unsubscribedAt);
    const csv = "Email,Data Iscrizione,Fonte\n" + activeSubscribers.map(s => 
      `${s.email},${s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""},${s.source || "website"}`
    ).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createMutation = useMutation({
    mutationFn: async (data: ArticleForm) => {
      await apiRequest("POST", "/api/news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Articolo creato", description: "L'articolo è stato pubblicato." });
      closeDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile creare l'articolo.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ArticleForm }) => {
      await apiRequest("PATCH", `/api/news/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Articolo aggiornato", description: "Le modifiche sono state salvate." });
      closeDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile aggiornare l'articolo.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Articolo eliminato", description: "L'articolo è stato rimosso." });
      setDeleteConfirm(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile eliminare l'articolo.", variant: "destructive" });
    },
  });

  const createInviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/invites", { email });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invites"] });
      const fullUrl = `${window.location.origin}${data.inviteUrl}`;
      setLastCreatedInviteUrl(fullUrl);
      setLastCreatedInviteEmail(data.email);
      setInviteEmail("");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: error.message || "Impossibile creare l'invito.", variant: "destructive" });
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/invites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invites"] });
      toast({ title: "Invito eliminato", description: "L'invito è stato rimosso." });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile eliminare l'invito.", variant: "destructive" });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      await apiRequest("POST", "/api/admin/reset-password", { userId, newPassword });
    },
    onSuccess: () => {
      toast({ title: "Password resettata", description: "La nuova password è stata impostata con successo." });
      setResetPasswordUserId(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile resettare la password.", variant: "destructive" });
    },
  });

  // Update role mutation (superadmin only)
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      await apiRequest("POST", "/api/admin/update-role", { userId, newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Ruolo aggiornato", description: "Il ruolo è stato modificato con successo." });
      setEditingRoleUserId(null);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile modificare il ruolo.", variant: "destructive" });
    },
  });

  // Delete user mutation (superadmin only)
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Utente eliminato", description: "L'utente è stato rimosso con successo." });
      setDeleteUserConfirm(null);
      setExpandedUserId(null);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile eliminare l'utente.", variant: "destructive" });
    },
  });

  // Seed professionals mutation
  const seedProfessionalsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/professionals/seed", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({ title: "Professionisti caricati", description: `${data.count} professionisti inseriti con successo.` });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: error.message || "Impossibile caricare i professionisti.", variant: "destructive" });
    },
  });

  // Professional mutations
  const createProfessionalMutation = useMutation({
    mutationFn: async (data: ProfessionalForm) => {
      await apiRequest("POST", "/api/professionals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({ title: "Professionista creato", description: "Il profilo è stato aggiunto." });
      closeProfessionalDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile creare il professionista.", variant: "destructive" });
    },
  });

  const updateProfessionalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProfessionalForm }) => {
      await apiRequest("PATCH", `/api/professionals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({ title: "Professionista aggiornato", description: "Le modifiche sono state salvate." });
      closeProfessionalDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile aggiornare il professionista.", variant: "destructive" });
    },
  });

  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/professionals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({ title: "Professionista eliminato", description: "Il profilo è stato rimosso." });
      setDeleteProfessionalConfirm(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Sessione scaduta", description: "Effettua nuovamente il login.", variant: "destructive" });
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      toast({ title: "Errore", description: "Impossibile eliminare il professionista.", variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingArticle(null);
    setForm(emptyForm);
  };

  const openNewArticle = () => {
    setEditingArticle(null);
    setForm(emptyForm);
    setLinkedinImportUrl("");
    setIsDialogOpen(true);
  };

  const handleLinkedinImport = async () => {
    if (!linkedinImportUrl.trim()) return;
    setIsImporting(true);
    try {
      const res = await apiRequest("POST", "/api/scrape-linkedin", { url: linkedinImportUrl.trim() });
      const data = await res.json();
      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        content: data.content || prev.content,
        excerpt: data.excerpt || prev.excerpt,
        imageUrl: data.imageUrl || prev.imageUrl,
        linkedinUrl: data.linkedinUrl || prev.linkedinUrl,
        readTime: data.readTime || prev.readTime,
      }));
      toast({ title: "Contenuto importato", description: "I campi sono stati compilati con il contenuto del post. Rivedi e completa prima di pubblicare." });
    } catch (error: any) {
      let msg = "Errore nel recupero del contenuto. Puoi compilare i campi manualmente.";
      try {
        const errorText = error?.message || "";
        const jsonPart = errorText.match(/\{.*\}/);
        if (jsonPart) {
          const parsed = JSON.parse(jsonPart[0]);
          msg = parsed.message || msg;
        }
      } catch {}
      toast({ title: "Importazione non riuscita", description: msg, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const openEditArticle = (article: NewsArticle) => {
    setEditingArticle(article);

    let resolvedIds: string[] = article.linkedProfessionalIds || [];
    if (resolvedIds.length === 0 && article.linkedProfessionalId) {
      resolvedIds = [article.linkedProfessionalId];
    }
    if (resolvedIds.length === 0 && professionals) {
      const areaIds: string[] = [];
      if (article.linkedPracticeArea) areaIds.push(article.linkedPracticeArea);
      if (article.tags) article.tags.forEach(t => { if (!areaIds.includes(t)) areaIds.push(t); });
      if (areaIds.length > 0) {
        resolvedIds = professionals
          .filter(p => (p.specializations || []).some(s => areaIds.includes(s)))
          .map(p => String(p.id));
      }
    }

    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      category: article.category,
      newsType: article.newsType || "studio",
      authorName: article.authorName || "",
      linkedProfessionalId: article.linkedProfessionalId || "",
      linkedProfessionalIds: resolvedIds,
      linkedPracticeArea: article.linkedPracticeArea || "",
      linkedinUrl: article.linkedinUrl || "",
      linkedinSummary: article.linkedinSummary || "",
      imageUrl: article.imageUrl || "",
      imagePosition: article.imagePosition || "50,50",
      imageZoom: article.imageZoom || 100,
      documentUrl: article.documentUrl || "",
      documentName: article.documentName || "",
      readTime: article.readTime || "5 min",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.linkedPracticeArea) {
      toast({ title: "Campi obbligatori", description: "Compila titolo, contenuto e area di attività.", variant: "destructive" });
      return;
    }
    const submitForm = { ...form };
    if (!submitForm.category && submitForm.linkedPracticeArea) {
      const area = practiceAreasEnhanced.find(a => a.id === submitForm.linkedPracticeArea);
      if (area) submitForm.category = area.titleIT;
    }
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: submitForm });
    } else {
      createMutation.mutate(submitForm);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast({ title: "Email richiesta", description: "Inserisci l'email del partner.", variant: "destructive" });
      return;
    }
    createInviteMutation.mutate(inviteEmail);
  };

  const copyInviteUrl = (url: string, id?: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id || url);
    setTimeout(() => setCopiedUrl(null), 2000);
    toast({ title: "Link copiato", description: "Il link di invito è stato copiato negli appunti." });
  };

  // Professional helper functions
  const closeProfessionalDialog = () => {
    setIsProfessionalDialogOpen(false);
    setEditingProfessional(null);
    setProfessionalForm(emptyProfessionalForm);
    setEducationInput("");
    setLanguageInput("");
  };

  const openNewProfessional = () => {
    setEditingProfessional(null);
    setProfessionalForm(emptyProfessionalForm);
    setEducationInput("");
    setLanguageInput("");
    setIsProfessionalDialogOpen(true);
  };

  const openEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setProfessionalForm({
      name: professional.name,
      title: professional.title,
      specializations: professional.specializations || [],
      office: professional.office,
      email: professional.email || "",
      phone: professional.phone || "",
      fullBio: professional.fullBio || "",
      education: professional.education || [],
      languages: professional.languages || [],
      imageUrl: professional.imageUrl || "",
      imagePosition: professional.imagePosition || "center",
      imageZoom: professional.imageZoom || 100,
    });
    setEducationInput("");
    setLanguageInput("");
    setIsProfessionalDialogOpen(true);
  };

  const handleProfessionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalForm.name || !professionalForm.title || !professionalForm.office) {
      toast({ title: "Campi obbligatori", description: "Compila nome, titolo e sede.", variant: "destructive" });
      return;
    }
    if (editingProfessional) {
      updateProfessionalMutation.mutate({ id: editingProfessional.id, data: professionalForm });
    } else {
      createProfessionalMutation.mutate(professionalForm);
    }
  };

  const addEducation = () => {
    if (educationInput.trim()) {
      setProfessionalForm({
        ...professionalForm,
        education: [...professionalForm.education, educationInput.trim()],
      });
      setEducationInput("");
    }
  };

  const removeEducation = (index: number) => {
    setProfessionalForm({
      ...professionalForm,
      education: professionalForm.education.filter((_, i) => i !== index),
    });
  };

  const addLanguage = () => {
    if (languageInput.trim()) {
      setProfessionalForm({
        ...professionalForm,
        languages: [...professionalForm.languages, languageInput.trim()],
      });
      setLanguageInput("");
    }
  };

  const removeLanguage = (index: number) => {
    setProfessionalForm({
      ...professionalForm,
      languages: professionalForm.languages.filter((_, i) => i !== index),
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pannello Amministrazione"
        description={`Benvenuto, ${user?.firstName || user?.email || "Partner"}`}
      />

      <section className="py-16">
        <div className="w-full px-6 md:px-12 lg:px-16">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/news">
              <Button variant="outline" size="sm" data-testid="link-back-news">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alle News
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="stats" className="w-full">
            <div className="mb-8">
              <div className="grid grid-cols-3 sm:grid-cols-5 md:flex md:flex-wrap gap-1 bg-muted p-1 rounded-md">
                <TabsList className="contents">
                  <TabsTrigger value="stats" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-stats">
                    <BarChart3 className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Statistiche</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="news" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-news">
                    <Newspaper className="h-4 w-4 shrink-0" />
                    News
                  </TabsTrigger>
                  <TabsTrigger value="professionals" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-professionals">
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Professionisti</span>
                    <span className="sm:hidden">Team</span>
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-categories">
                    <FolderTree className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Aree di Attività</span>
                    <span className="sm:hidden">Aree</span>
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="gap-1.5 text-xs sm:text-sm relative" data-testid="tab-messages">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Messaggi</span>
                    <span className="sm:hidden">Msg</span>
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="newsletter" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-newsletter">
                    <MailPlus className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Newsletter</span>
                    <span className="sm:hidden">Mail</span>
                  </TabsTrigger>
                  <TabsTrigger value="invites" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-invites">
                    <UserPlus className="h-4 w-4 shrink-0" />
                    Inviti
                  </TabsTrigger>
                  <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-users">
                    <Users className="h-4 w-4 shrink-0" />
                    Utenti
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-security">
                    <Shield className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Sicurezza</span>
                    <span className="sm:hidden">2FA</span>
                  </TabsTrigger>
                  <TabsTrigger value="conversations" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-conversations">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Conversazioni</span>
                    <span className="sm:hidden">Chat</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="stats">
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stats ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Newspaper className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{stats.totals.articles}</p>
                            <p className="text-xs text-muted-foreground">Articoli totali</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{stats.totals.professionals}</p>
                            <p className="text-xs text-muted-foreground">Professionisti</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <MailPlus className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{stats.totals.subscribers}</p>
                            <p className="text-xs text-muted-foreground">Iscritti newsletter</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <FolderTree className="h-6 w-6 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{practiceAreasEnhanced.length}</p>
                            <p className="text-xs text-muted-foreground">Aree di Attività</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Dettagli Articoli</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">News dello Studio</span>
                          <span className="font-medium">{stats.articles.studio}</span>
                        </div>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Pubblicati</span>
                            <Badge variant="default">{stats.articles.published}</Badge>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">Bozze</span>
                            <Badge variant="secondary">{stats.articles.draft}</Badge>
                          </div>
                        </div>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Ultimo mese</span>
                            <span className="font-medium text-primary">+{stats.articles.lastMonth}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Aree di Attività</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Totale aree</span>
                          <span className="font-medium">{practiceAreasEnhanced.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Con articoli collegati</span>
                          <span className="font-medium">{practiceAreasEnhanced.filter(a => articles.some(art => art.linkedPracticeArea === a.id)).length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Newsletter</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Iscritti attivi</span>
                          <Badge variant="default">{stats.newsletter.active}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Iscritti totali</span>
                          <span className="font-medium">{stats.newsletter.total}</span>
                        </div>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Ultimo mese</span>
                            <span className="font-medium text-green-600">+{stats.newsletter.lastMonth}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nessuna statistica disponibile</h3>
                  <p className="text-muted-foreground">
                    Inizia a creare contenuti per vedere le statistiche del sito.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="news">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <Badge variant="secondary" className="text-sm">
                  {articles.length} articoli pubblicati
                </Badge>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await apiRequest("POST", "/api/news/auto-fit-images");
                        const data = await res.json();
                        toast({ title: "Immagini adattate", description: data.message });
                        queryClient.invalidateQueries({ queryKey: ["/api/news"] });
                      } catch {
                        toast({ title: "Errore", description: "Impossibile adattare le immagini", variant: "destructive" });
                      }
                    }}
                    data-testid="button-auto-fit-images"
                  >
                    <Maximize className="h-4 w-4 mr-2" />
                    Adatta Immagini
                  </Button>
                  <Button onClick={openNewArticle} data-testid="button-new-article">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Articolo
                  </Button>
                </div>
              </div>

              {articlesLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-40 bg-muted" />
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <Card className="p-12 text-center">
                  <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nessun articolo</h3>
                  <p className="text-muted-foreground mb-6">
                    Non hai ancora pubblicato nessun articolo. Inizia creando il tuo primo contenuto.
                  </p>
                  <Button onClick={openNewArticle}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crea il primo articolo
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Card key={article.id} className="overflow-hidden flex flex-col" data-testid={`card-admin-article-${article.id}`}>
                      <div
                        className="aspect-video overflow-hidden bg-muted relative cursor-pointer group/img"
                        onClick={(e) => { if (article.imageUrl) { e.stopPropagation(); setLightboxImage(article.imageUrl); }}}
                        data-testid={`preview-article-img-${article.id}`}
                      >
                        {article.imageUrl ? (
                          <>
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover"
                              style={getImageCropStyle(article.imagePosition, article.imageZoom)}
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                              <Maximize className="h-6 w-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">{article.category}</Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-xs text-foreground/70 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                            {article.createdAt && new Date(article.createdAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {article.excerpt || article.content.slice(0, 100)}...
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `${window.location.origin}/news?article=${article.id}`;
                              navigator.clipboard.writeText(url);
                              toast({ title: "Link copiato!", description: "Il link all'articolo è stato copiato negli appunti." });
                            }}
                            data-testid={`button-copy-link-${article.id}`}
                          >
                            <Link2 className="h-4 w-4 mr-1" />
                            Copia Link
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const articleUrl = `${window.location.origin}/news?article=${article.id}`;
                              const postText = `${article.linkedinSummary || article.excerpt || article.title}\n\n${articleUrl}`;
                              const linkedinPostUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
                              window.open(linkedinPostUrl, '_blank');
                            }}
                            className="bg-[#0A66C2] text-white border-[#0A66C2]"
                            data-testid={`button-share-linkedin-${article.id}`}
                          >
                            <SiLinkedin className="h-4 w-4 mr-1" />
                            LinkedIn
                          </Button>
                        </div>
                        <div className="flex gap-2 flex-wrap mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditArticle(article)}
                            data-testid={`button-edit-${article.id}`}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Modifica
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteConfirm(article.id)}
                            data-testid={`button-delete-${article.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Elimina
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="professionals">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <Badge variant="secondary" className="text-sm">
                  {professionals.length} professionisti
                </Badge>
                <Button onClick={openNewProfessional} data-testid="button-new-professional">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Professionista
                </Button>
              </div>

              {professionalsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-40 bg-muted" />
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : professionals.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nessun professionista</h3>
                  <p className="text-muted-foreground mb-6">
                    Non hai ancora aggiunto nessun professionista. Puoi caricare i professionisti esistenti o crearne di nuovi.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button 
                      onClick={() => seedProfessionalsMutation.mutate()}
                      disabled={seedProfessionalsMutation.isPending}
                      variant="default"
                      data-testid="button-seed-professionals"
                    >
                      {seedProfessionalsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Users className="h-4 w-4 mr-2" />
                      )}
                      Carica Professionisti Esistenti
                    </Button>
                    <Button onClick={openNewProfessional} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi manualmente
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {professionals.map((professional) => (
                    <Card key={professional.id} className="overflow-hidden" data-testid={`card-admin-professional-${professional.id}`}>
                      {professional.imageUrl && !isLogoPlaceholderCheck(professional.imageUrl) ? (
                        <div
                          className="aspect-square overflow-hidden relative cursor-pointer group/img"
                          onClick={(e) => { e.stopPropagation(); setLightboxImage(professional.imageUrl!); }}
                          data-testid={`preview-pro-img-${professional.id}`}
                        >
                          <img
                            src={professional.imageUrl}
                            alt={professional.name}
                            className="w-full h-full object-cover"
                            style={getImageCropStyle(professional.imagePosition, professional.imageZoom)}
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize className="h-6 w-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                        </div>
                      ) : (
                        <CardQuickUpload professionalId={professional.id} professionalName={professional.name} />
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary">{professional.office}</Badge>
                          <Badge variant="outline">{professional.title}</Badge>
                        </div>
                        <CardTitle className="text-lg">{professional.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-4">
                          {professional.specializations && professional.specializations.length > 0 ? (
                            professional.specializations.map((specId) => {
                              const area = getPracticeAreaBySpecId(specId);
                              return (
                                <Badge key={specId} variant="secondary" className="text-xs">
                                  {area?.titleIT || specId}
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-sm text-muted-foreground">Nessuna specializzazione</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditProfessional(professional)}
                            data-testid={`button-edit-professional-${professional.id}`}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Modifica
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteProfessionalConfirm(professional.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-professional-${professional.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Elimina
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-sm">
                    {practiceAreasEnhanced.length} aree di attività
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {practiceAreasEnhanced.filter(a => articles.some(art => art.linkedPracticeArea === a.id)).length} con articoli
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {[...practiceAreasEnhanced].sort((a, b) => a.titleIT.localeCompare(b.titleIT, "it")).map((area) => {
                  const linkedArticles = articles.filter(art => art.linkedPracticeArea === area.id);
                  const linkedProfessionals = professionals.filter(p => p.specializations && p.specializations.includes(area.id));
                  const isExpanded = expandedAreaId === area.id;
                  const hasContent = linkedArticles.length > 0 || linkedProfessionals.length > 0;
                  return (
                    <div key={area.id} className="bg-muted rounded-lg overflow-hidden">
                      <button
                        type="button"
                        className="flex items-center justify-between p-4 w-full text-left gap-4"
                        onClick={() => hasContent && setExpandedAreaId(isExpanded ? null : area.id)}
                        data-testid={`area-row-${area.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{area.titleIT}</p>
                          <p className="text-xs text-muted-foreground">{area.titleEN}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            <Newspaper className="h-3 w-3 mr-1" />
                            {linkedArticles.length} news
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {linkedProfessionals.length}
                          </Badge>
                          {hasContent && (
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </button>
                      {isExpanded && hasContent && (
                        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-3">
                          {linkedArticles.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">News collegate</p>
                              <div className="space-y-2">
                                {linkedArticles.map((art) => (
                                  <div key={art.id} className="flex items-center justify-between gap-2 p-2 bg-background rounded-md">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{art.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {art.createdAt && new Date(art.createdAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                        {art.authorName && ` · ${art.authorName}`}
                                      </p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditArticle(art); }} data-testid={`area-edit-article-${art.id}`}>
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={(e) => {
                                        e.stopPropagation();
                                        const url = `${window.location.origin}/news?article=${art.id}`;
                                        window.open(url, '_blank');
                                      }} data-testid={`area-view-article-${art.id}`}>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {linkedProfessionals.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Professionisti</p>
                              <div className="flex flex-wrap gap-2">
                                {linkedProfessionals.map((pro) => (
                                  <Badge key={pro.id} variant="secondary" className="text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    {pro.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm">
                    {contactMessages.length} messaggi totali
                  </Badge>
                  {unreadMessagesCount > 0 && (
                    <Badge variant="destructive" className="text-sm">
                      {unreadMessagesCount} non letti
                    </Badge>
                  )}
                </div>
              </div>

              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : contactMessages.length === 0 ? (
                <Card className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nessun messaggio</h3>
                  <p className="text-muted-foreground">
                    Non ci sono ancora messaggi dal form di contatto. I visitatori potranno inviare messaggi dalla pagina Contatti.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contactMessages.map((msg) => (
                    <Card 
                      key={msg.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${msg.isRead !== "true" ? "ring-2 ring-primary/20 bg-primary/5" : ""}`}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (msg.isRead !== "true") {
                          markMessageReadMutation.mutate(msg.id);
                        }
                      }}
                      data-testid={`message-card-${msg.id}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="font-semibold line-clamp-1">{msg.name}</h4>
                            <p className="text-xs text-muted-foreground">{msg.email}</p>
                          </div>
                          {msg.isRead !== "true" && (
                            <span className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <Badge variant={msg.isRead === "true" ? "secondary" : "default"} className="mb-3">
                          {msg.subject === "consulenza" ? "Consulenza" :
                           msg.subject === "informazioni" ? "Informazioni" :
                           msg.subject === "collaborazione" ? "Collaborazione" : "Altro"}
                        </Badge>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{msg.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {msg.createdAt && new Date(msg.createdAt).toLocaleString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Message Detail Dialog */}
              <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent className="max-w-2xl">
                  {selectedMessage && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-xl">{selectedMessage.name}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {selectedMessage.subject === "consulenza" ? "Richiesta Consulenza" :
                             selectedMessage.subject === "informazioni" ? "Richiesta Informazioni" :
                             selectedMessage.subject === "collaborazione" ? "Proposta Collaborazione" : "Altro"}
                          </Badge>
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        {/* Contact Info Section */}
                        <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
                          <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Informazioni di Contatto</h5>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <a 
                              href={`mailto:${selectedMessage.email}`}
                              className="flex items-center gap-3 p-3 rounded-lg bg-background border hover:border-primary hover:bg-primary/5 transition-colors group"
                              data-testid="button-email-contact"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                <Mail className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium truncate">{selectedMessage.email}</p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </a>
                            
                            {selectedMessage.phone ? (
                              <a 
                                href={`tel:${selectedMessage.phone.replace(/\s/g, '')}`}
                                className="flex items-center gap-3 p-3 rounded-lg bg-background border hover:border-primary hover:bg-primary/5 transition-colors group"
                                data-testid="button-phone-contact"
                              >
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                                  <Phone className="h-5 w-5 text-green-600 group-hover:text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground">Telefono</p>
                                  <p className="font-medium">{selectedMessage.phone}</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                              </a>
                            ) : (
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border opacity-50">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <Phone className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Telefono</p>
                                  <p className="text-sm text-muted-foreground italic">Non fornito</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Message Section */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Messaggio</h5>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg border">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedMessage.message}</p>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Ricevuto il {selectedMessage.createdAt && new Date(selectedMessage.createdAt).toLocaleString("it-IT", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t">
                          <a 
                            href={`mailto:${selectedMessage.email}?subject=Re: ${
                              selectedMessage.subject === "consulenza" ? "Richiesta di Consulenza - LEGALIT" : 
                              selectedMessage.subject === "informazioni" ? "Richiesta Informazioni - LEGALIT" : 
                              selectedMessage.subject === "collaborazione" ? "Proposta di Collaborazione - LEGALIT" : 
                              "Richiesta dal sito - LEGALIT"
                            }`}
                            className="flex-1 min-w-[140px]"
                          >
                            <Button className="w-full" data-testid="button-reply-email">
                              <Mail className="h-4 w-4 mr-2" />
                              Rispondi via Email
                            </Button>
                          </a>
                          {selectedMessage.phone && (
                            <a 
                              href={`tel:${selectedMessage.phone.replace(/\s/g, '')}`}
                              className="flex-1 min-w-[140px]"
                            >
                              <Button variant="outline" className="w-full" data-testid="button-call">
                                <Phone className="h-4 w-4 mr-2" />
                                Chiama
                              </Button>
                            </a>
                          )}
                          {deleteMessageConfirm === selectedMessage.id ? (
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  deleteMessageMutation.mutate(selectedMessage.id);
                                  setDeleteMessageConfirm(null);
                                  setSelectedMessage(null);
                                }}
                                data-testid="button-confirm-delete-modal"
                              >
                                Conferma Eliminazione
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteMessageConfirm(null)}
                              >
                                Annulla
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => setDeleteMessageConfirm(selectedMessage.id)}
                              data-testid="button-delete-modal"
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                              Elimina
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="newsletter">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <Badge variant="secondary" className="text-sm">
                  {subscribers.filter(s => !s.unsubscribedAt).length} iscritti attivi
                </Badge>
                <Button onClick={exportSubscribers} variant="outline" data-testid="button-export-subscribers">
                  <Download className="h-4 w-4 mr-2" />
                  Esporta CSV
                </Button>
              </div>

              {subscribersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subscribers.length === 0 ? (
                <Card className="p-12 text-center">
                  <MailPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nessun iscritto</h3>
                  <p className="text-muted-foreground">
                    Non ci sono ancora iscritti alla newsletter. Gli utenti potranno iscriversi tramite il form sul sito.
                  </p>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MailPlus className="h-5 w-5" />
                      Iscritti alla Newsletter
                    </CardTitle>
                    <CardDescription>
                      Lista di tutti gli iscritti alla newsletter
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {subscribers.map((sub) => (
                        <div 
                          key={sub.id} 
                          className={`flex items-center justify-between p-3 rounded-lg ${sub.unsubscribedAt ? 'bg-muted/50 opacity-60' : 'bg-muted'}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{sub.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Iscritto il: {sub.subscribedAt && new Date(sub.subscribedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                              {sub.unsubscribedAt && ` • Disiscritto il: ${new Date(sub.unsubscribedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                            </p>
                          </div>
                          <Badge variant={sub.unsubscribedAt ? "secondary" : "default"}>
                            {sub.unsubscribedAt ? "Disiscritto" : "Attivo"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="invites">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Nuovo Invito
                    </CardTitle>
                    <CardDescription>
                      Invita un nuovo partner inserendo la sua email. Riceverà un link per registrarsi.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleInviteSubmit} className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="email@esempio.it"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1"
                        data-testid="input-invite-email"
                      />
                      <Button type="submit" disabled={createInviteMutation.isPending} data-testid="button-send-invite">
                        {createInviteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Invita
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {lastCreatedInviteUrl && (
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Invito Creato
                      </CardTitle>
                      <CardDescription>
                        Copia il link qui sotto e invialo a <strong>{lastCreatedInviteEmail}</strong>. Il link sarà visibile solo in questo momento.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Input
                          value={lastCreatedInviteUrl}
                          readOnly
                          className="flex-1 text-xs font-mono"
                          data-testid="input-invite-url"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyInviteUrl(lastCreatedInviteUrl, "last-created")}
                          data-testid="button-copy-last-invite"
                        >
                          {copiedUrl === "last-created" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => { setLastCreatedInviteUrl(null); setLastCreatedInviteEmail(null); }}
                        data-testid="button-dismiss-invite-url"
                      >
                        Chiudi
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Inviti Pendenti
                    </CardTitle>
                    <CardDescription>
                      Inviti non ancora utilizzati. Gli inviti scadono dopo 48 ore.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invitesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : invites.filter(i => !i.usedAt).length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nessun invito pendente
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {invites.filter(i => !i.usedAt).map((invite) => (
                          <div
                            key={invite.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            data-testid={`invite-${invite.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{invite.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Scade: {invite.expiresAt && new Date(invite.expiresAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteInviteMutation.mutate(invite.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-invite-${invite.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestione Utenti
                  </CardTitle>
                  <CardDescription>
                    Visualizza gli utenti registrati e resetta le password se necessario.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : adminUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nessun utente registrato
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {adminUsers.filter(u => u.role !== 'superadmin').map((adminUser) => (
                        <Collapsible
                          key={adminUser.id}
                          open={expandedUserId === adminUser.id}
                          onOpenChange={(open) => setExpandedUserId(open ? adminUser.id : null)}
                        >
                          <div className="bg-muted rounded-lg overflow-hidden" data-testid={`user-${adminUser.id}`}>
                            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/80 transition-colors">
                              <div className="flex-1 min-w-0 text-left">
                                <p className="font-medium">
                                  {adminUser.firstName} {adminUser.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">{adminUser.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {adminUser.role || "partner"}
                                </Badge>
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedUserId === adminUser.id ? 'rotate-180' : ''}`} />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                                {/* Reset Password */}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Password</span>
                                  {resetPasswordUserId === adminUser.id ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="password"
                                        placeholder="Nuova password (min 8 caratteri)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-48 h-8"
                                        data-testid="input-new-password"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          if (newPassword.length >= 8) {
                                            resetPasswordMutation.mutate({ userId: adminUser.id, newPassword });
                                          } else {
                                            toast({ title: "Errore", description: "La password deve essere almeno 8 caratteri.", variant: "destructive" });
                                          }
                                        }}
                                        disabled={resetPasswordMutation.isPending}
                                        data-testid="button-confirm-reset"
                                      >
                                        {resetPasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => { setResetPasswordUserId(null); setNewPassword(""); }}>
                                        Annulla
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button variant="outline" size="sm" onClick={() => setResetPasswordUserId(adminUser.id)} data-testid={`button-reset-password-${adminUser.id}`}>
                                      Reset Password
                                    </Button>
                                  )}
                                </div>
                                
                                {/* Role management - only for superadmin */}
                                {isSuperAdmin && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Ruolo</span>
                                    {editingRoleUserId === adminUser.id ? (
                                      <div className="flex items-center gap-2">
                                        <Select
                                          defaultValue={adminUser.role || "partner"}
                                          onValueChange={(value) => {
                                            updateRoleMutation.mutate({ userId: adminUser.id, newRole: value });
                                          }}
                                        >
                                          <SelectTrigger className="w-32 h-8" data-testid="select-role">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="partner">Partner</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingRoleUserId(null)}>
                                          Annulla
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button variant="outline" size="sm" onClick={() => setEditingRoleUserId(adminUser.id)} data-testid={`button-edit-role-${adminUser.id}`}>
                                        Modifica Ruolo
                                      </Button>
                                    )}
                                  </div>
                                )}
                                
                                {/* Delete user button - superadmin only */}
                                {user?.role === 'superadmin' && (
                                  <div className="pt-2 mt-2 border-t">
                                    {deleteUserConfirm === adminUser.id ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-destructive">Confermi eliminazione?</span>
                                        <Button 
                                          size="sm" 
                                          variant="destructive" 
                                          onClick={() => deleteUserMutation.mutate(adminUser.id)}
                                          disabled={deleteUserMutation.isPending}
                                          data-testid={`button-confirm-delete-${adminUser.id}`}
                                        >
                                          {deleteUserMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sì, elimina"}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setDeleteUserConfirm(null)}>
                                          Annulla
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-destructive border-destructive hover:bg-destructive/10"
                                        onClick={() => setDeleteUserConfirm(adminUser.id)}
                                        data-testid={`button-delete-user-${adminUser.id}`}
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Elimina Utente
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Autenticazione a Due Fattori (2FA)
                  </CardTitle>
                  <CardDescription>
                    Proteggi il tuo account con un secondo livello di sicurezza. Quando abilitato, ti verrà richiesto un codice dalla tua app di autenticazione ad ogni accesso.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user?.twoFactorEnabled ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Check className="h-6 w-6 text-green-600" />
                        <div>
                          <h4 className="font-semibold text-green-700">2FA Attivo</h4>
                          <p className="text-sm text-muted-foreground">Il tuo account è protetto dall'autenticazione a due fattori.</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <h5 className="font-medium">Disattiva 2FA</h5>
                        <p className="text-sm text-muted-foreground">Per disattivare il 2FA, inserisci il codice dalla tua app di autenticazione.</p>
                        <div className="flex gap-3">
                          <Input
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={disableCode}
                            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                            className="max-w-[150px] text-center font-mono"
                            data-testid="input-disable-2fa-code"
                          />
                          <Button
                            variant="destructive"
                            onClick={() => disable2FAMutation.mutate(disableCode)}
                            disabled={disableCode.length !== 6 || disable2FAMutation.isPending}
                            data-testid="button-disable-2fa"
                          >
                            {disable2FAMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Disattiva 2FA
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : twoFactorSetup ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                        <Smartphone className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="font-semibold">Configura la tua App di Autenticazione</h4>
                          <p className="text-sm text-muted-foreground">Scansiona il QR code con Google Authenticator, Authy o un'app simile.</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-white rounded-lg">
                          <img src={twoFactorSetup.qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48" loading="lazy" decoding="async" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Se non riesci a scansionare il QR code, inserisci manualmente questa chiave:<br />
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{twoFactorSetup.secret}</code>
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Verifica il codice</Label>
                        <p className="text-sm text-muted-foreground">Inserisci il codice a 6 cifre dalla tua app per confermare la configurazione.</p>
                        <div className="flex gap-3">
                          <Input
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                            className="max-w-[150px] text-center font-mono text-lg"
                            data-testid="input-verify-2fa-code"
                          />
                          <Button
                            onClick={() => enable2FAMutation.mutate({ secret: twoFactorSetup.secret, code: twoFactorCode })}
                            disabled={twoFactorCode.length !== 6 || enable2FAMutation.isPending}
                            data-testid="button-enable-2fa"
                          >
                            {enable2FAMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Attiva 2FA
                          </Button>
                        </div>
                      </div>
                      
                      <Button variant="ghost" onClick={() => { setTwoFactorSetup(null); setTwoFactorCode(""); }}>
                        Annulla
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <Shield className="h-6 w-6 text-amber-600" />
                        <div>
                          <h4 className="font-semibold text-amber-700">2FA Non Attivo</h4>
                          <p className="text-sm text-muted-foreground">Attiva l'autenticazione a due fattori per una maggiore sicurezza.</p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setup2FAMutation.mutate()}
                        disabled={setup2FAMutation.isPending}
                        className="gap-2"
                        data-testid="button-setup-2fa"
                      >
                        {setup2FAMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        Configura 2FA
                      </Button>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <h5 className="font-medium mb-2">Suggerimenti per la sicurezza</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Usa una password unica e complessa di almeno 8 caratteri</li>
                      <li>• Includi lettere maiuscole, minuscole e numeri</li>
                      <li>• Non condividere mai le tue credenziali</li>
                      <li>• Effettua sempre il logout dopo l'uso su dispositivi condivisi</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversations">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : selectedConversation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setSelectedConversation(null)} data-testid="button-back-conversations">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Torna alla lista
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{selectedConversation.ipAddress || "IP sconosciuto"}</Badge>
                      <Badge variant="outline">{selectedConversation.messageCount || 0} messaggi</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => deleteConversationMutation.mutate(selectedConversation.id)}
                        data-testid="button-delete-conversation"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Elimina
                      </Button>
                    </div>
                  </div>
                  <Card>
                    <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                      {selectedConversation.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                            data-testid={`conv-msg-${msg.role}-${i}`}
                          >
                            <p>{msg.text.replace(/\[SHOW_CARD:\s*CONFIRM_TRIAGE\]|\[DIRECT_LINK:\s*[^\]]+\]|\[VIEW_ALL_PROFESSIONALS\]|\[SHOW_LOG\]/g, "").trim()}</p>
                            {msg.timestamp && (
                              <p className="text-[10px] mt-1 opacity-60">
                                {new Date(msg.timestamp).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ) : conversations.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Nessuna conversazione registrata.</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Le conversazioni del chatbot appariranno qui.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{conversations.length} conversazioni totali</p>
                  {conversations.map((conv) => {
                    const firstUserMsg = conv.messages.find(m => m.role === "user");
                    const preview = firstUserMsg ? firstUserMsg.text.slice(0, 120) + (firstUserMsg.text.length > 120 ? "..." : "") : "—";
                    return (
                      <Card
                        key={conv.id}
                        className="cursor-pointer hover-elevate"
                        onClick={() => setSelectedConversation(conv)}
                        data-testid={`card-conversation-${conv.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{preview}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="secondary" className="text-[10px]">{conv.messageCount || 0} msg</Badge>
                                <Badge variant="outline" className="text-[10px]">{conv.ipAddress || "—"}</Badge>
                                {conv.updatedAt && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(conv.updatedAt).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Modifica Articolo" : "Nuovo Articolo"}</DialogTitle>
            <DialogDescription>
              {editingArticle ? "Modifica i dettagli dell'articolo." : "Compila i campi per creare un nuovo articolo."}
            </DialogDescription>
          </DialogHeader>
          {!editingArticle && (
            <div className="bg-[#0A66C2]/5 border border-[#0A66C2]/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />
                <span className="text-sm font-medium">Importa da LinkedIn</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Incolla il link di un post LinkedIn per compilare automaticamente i campi.
              </p>
              <div className="flex gap-2">
                <Input
                  value={linkedinImportUrl}
                  onChange={(e) => setLinkedinImportUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/posts/..."
                  className="flex-1"
                  data-testid="input-linkedin-import-url"
                />
                <Button
                  type="button"
                  onClick={handleLinkedinImport}
                  disabled={!linkedinImportUrl.trim() || isImporting}
                  className="bg-[#0A66C2] text-white"
                  data-testid="button-linkedin-import"
                >
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span className="ml-1.5">{isImporting ? "Importo..." : "Importa"}</span>
                </Button>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Inserisci il titolo dell'articolo"
                data-testid="input-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Autore</Label>
                <Select value={form.authorName || "none"} onValueChange={(v) => setForm({ ...form, authorName: v === "none" ? "" : v })}>
                  <SelectTrigger data-testid="select-author-name">
                    <SelectValue placeholder="Seleziona autore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Nessun autore --</SelectItem>
                    <SelectItem value="LEGALIT">LEGALIT (Studio)</SelectItem>
                    {professionals?.map((prof) => (
                      <SelectItem key={prof.id} value={prof.name}>{prof.name} · {prof.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Seleziona l'autore dell'articolo. Apparirà nella card della news.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedPracticeArea">Area di Attività *</Label>
                <Select value={form.linkedPracticeArea || "none"} onValueChange={(v) => {
                  const areaId = v === "none" ? "" : v;
                  const area = practiceAreasEnhanced.find(a => a.id === areaId);
                  setForm({ ...form, linkedPracticeArea: areaId, category: area ? area.titleIT : form.category });
                }}>
                  <SelectTrigger data-testid="select-linked-practice-area">
                    <SelectValue placeholder="Seleziona area di attività" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Nessuna --</SelectItem>
                    {sortedPracticeAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>{area.titleIT}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Collega la news all'area di attività per mostrarla nella sezione dedicata.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Professionisti Collegati</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" type="button" data-testid="toggle-linked-professionals">
                    <span className="text-sm">
                      {form.linkedProfessionalIds.length > 0
                        ? `${form.linkedProfessionalIds.length} professionista/i selezionato/i`
                        : "Seleziona professionisti"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border rounded-md p-3 mt-2 max-h-48 overflow-y-auto space-y-1" data-testid="checkbox-linked-professionals">
                    {professionals?.map((prof) => {
                      const profId = String(prof.id);
                      const isChecked = form.linkedProfessionalIds.includes(profId);
                      return (
                        <label key={prof.id} className="flex items-center gap-2 py-1 px-1 rounded hover-elevate cursor-pointer" data-testid={`checkbox-pro-${prof.id}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const ids = isChecked
                                ? form.linkedProfessionalIds.filter(id => id !== profId)
                                : [...form.linkedProfessionalIds, profId];
                              setForm({ ...form, linkedProfessionalIds: ids, linkedProfessionalId: ids[0] || "" });
                            }}
                            className="h-4 w-4 rounded border-muted-foreground/50 accent-primary"
                          />
                          <span className="text-sm">{prof.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{prof.office}</span>
                        </label>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">Link Post LinkedIn (opzionale)</Label>
              <Input
                id="linkedinUrl"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                placeholder="https://www.linkedin.com/posts/..."
                data-testid="input-linkedin-url"
              />
              <p className="text-xs text-muted-foreground">
                Se inserito, il clic sull'articolo aprirà il post LinkedIn invece della pagina articolo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Estratto</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Breve descrizione dell'articolo (opzionale)"
                rows={2}
                data-testid="input-excerpt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinSummary">Testo per LinkedIn (opzionale)</Label>
              <Textarea
                id="linkedinSummary"
                value={form.linkedinSummary}
                onChange={(e) => setForm({ ...form, linkedinSummary: e.target.value })}
                placeholder="Mini-riassunto da usare quando condividi l'articolo su LinkedIn."
                rows={2}
                data-testid="input-linkedin-summary"
              />
              <p className="text-xs text-muted-foreground">Mini-riassunto da usare quando condividi l'articolo su LinkedIn.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenuto *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Scrivi il contenuto dell'articolo..."
                rows={10}
                data-testid="input-content"
              />
            </div>

            <div className="space-y-2">
              <Label>Immagine Articolo</Label>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url || "" })}
                aspectRatio="video"
              />
            </div>

            {form.imageUrl && (
              <div className="space-y-2">
                <ImageCropEditor
                  key={`news-${form.imageUrl}-${form.imagePosition}`}
                  imageUrl={form.imageUrl}
                  initialOffsetX={(() => {
                    const pos = form.imagePosition;
                    if (pos && pos.includes(",")) {
                      const [x] = pos.split(",").map(Number);
                      return isNaN(x) ? 50 : x;
                    }
                    return 50;
                  })()}
                  initialOffsetY={(() => {
                    const pos = form.imagePosition;
                    if (pos && pos.includes(",")) {
                      const [, y] = pos.split(",").map(Number);
                      return isNaN(y) ? 50 : y;
                    }
                    return 50;
                  })()}
                  initialZoom={form.imageZoom || 100}
                  aspectRatio={16 / 10}
                  onConfirm={(offsetX, offsetY, zoom) => {
                    setForm({
                      ...form,
                      imagePosition: `${offsetX},${offsetY}`,
                      imageZoom: zoom,
                    });
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Documento Allegato (opzionale)</Label>
              <FileUpload
                value={form.documentUrl}
                fileName={form.documentName}
                onChange={(url, name) => setForm({ ...form, documentUrl: url || "", documentName: name || "" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="readTime">Tempo di lettura</Label>
              <Input
                id="readTime"
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                placeholder="5 min"
                data-testid="input-read-time"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-article"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvataggio..."
                  : editingArticle
                  ? "Salva Modifiche"
                  : "Pubblica"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questo articolo? L'azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Eliminazione..." : "Elimina"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfessionalDialogOpen} onOpenChange={setIsProfessionalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfessional ? "Modifica Professionista" : "Nuovo Professionista"}</DialogTitle>
            <DialogDescription>
              {editingProfessional ? "Modifica i dettagli del professionista." : "Compila i campi per aggiungere un nuovo professionista."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfessionalSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prof-name">Nome Completo *</Label>
                <Input
                  id="prof-name"
                  value={professionalForm.name}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, name: e.target.value })}
                  placeholder="Nome e Cognome"
                  data-testid="input-professional-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prof-title">Titolo *</Label>
                <Select value={professionalForm.title} onValueChange={(v) => setProfessionalForm({ ...professionalForm, title: v })}>
                  <SelectTrigger data-testid="select-professional-title">
                    <SelectValue placeholder="Seleziona titolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {titles.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prof-office">Sede *</Label>
                <Select value={professionalForm.office} onValueChange={(v) => setProfessionalForm({ ...professionalForm, office: v })}>
                  <SelectTrigger data-testid="select-professional-office">
                    <SelectValue placeholder="Seleziona sede" />
                  </SelectTrigger>
                  <SelectContent>
                    {offices.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specializzazioni (Aree di Attività)</Label>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      type="button"
                      data-testid="button-specializations-dropdown"
                    >
                      <span className="text-left truncate">
                        {professionalForm.specializations.length === 0 
                          ? "Seleziona le aree di attività..." 
                          : `${professionalForm.specializations.length} area/e selezionata/e`}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="border rounded-md p-3 max-h-60 overflow-y-auto space-y-2 bg-background">
                      {practiceAreasEnhanced.map((area) => (
                        <div key={area.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`spec-${area.id}`}
                            checked={professionalForm.specializations.includes(area.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setProfessionalForm({
                                  ...professionalForm,
                                  specializations: [...professionalForm.specializations, area.id]
                                });
                              } else {
                                setProfessionalForm({
                                  ...professionalForm,
                                  specializations: professionalForm.specializations.filter(s => s !== area.id)
                                });
                              }
                            }}
                            data-testid={`checkbox-specialization-${area.id}`}
                          />
                          <label 
                            htmlFor={`spec-${area.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {area.titleIT}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                {professionalForm.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {professionalForm.specializations.map((specId) => {
                      const area = getPracticeAreaBySpecId(specId);
                      return (
                        <Badge 
                          key={specId} 
                          variant="secondary"
                          className="flex items-center gap-1 text-xs"
                        >
                          {area?.titleIT || specId}
                          <button
                            type="button"
                            onClick={() => setProfessionalForm({
                              ...professionalForm,
                              specializations: professionalForm.specializations.filter(s => s !== specId)
                            })}
                            className="ml-1 hover:text-destructive"
                            aria-label={`Rimuovi ${area?.titleIT || specId}`}
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prof-email">Email</Label>
                <Input
                  id="prof-email"
                  type="email"
                  value={professionalForm.email}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, email: e.target.value })}
                  placeholder="email@legalit.it"
                  data-testid="input-professional-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prof-phone">Telefono</Label>
                <Input
                  id="prof-phone"
                  value={professionalForm.phone}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, phone: e.target.value })}
                  placeholder="+39 ..."
                  data-testid="input-professional-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prof-fullbio">Profilo completo</Label>
              <Textarea
                id="prof-fullbio"
                value={professionalForm.fullBio}
                onChange={(e) => setProfessionalForm({ ...professionalForm, fullBio: e.target.value })}
                placeholder="Descrizione dettagliata del professionista..."
                rows={5}
                data-testid="input-professional-fullbio"
              />
            </div>

            <div className="space-y-2">
              <Label>Foto Professionista</Label>
              <ImageUpload
                value={professionalForm.imageUrl}
                onChange={(url) => setProfessionalForm({ ...professionalForm, imageUrl: url || "" })}
                aspectRatio="portrait"
              />
            </div>

            {professionalForm.imageUrl && !isLogoPlaceholderCheck(professionalForm.imageUrl) && (
              <div className="space-y-2">
                <ImageCropEditor
                  key={`${professionalForm.imageUrl}-${professionalForm.imagePosition}`}
                  imageUrl={professionalForm.imageUrl}
                  initialOffsetX={(() => {
                    const pos = professionalForm.imagePosition;
                    if (pos && pos.includes(",")) {
                      const [x] = pos.split(",").map(Number);
                      return isNaN(x) ? 50 : x;
                    }
                    return 50;
                  })()}
                  initialOffsetY={(() => {
                    const pos = professionalForm.imagePosition;
                    if (pos && pos.includes(",")) {
                      const [, y] = pos.split(",").map(Number);
                      return isNaN(y) ? 50 : y;
                    }
                    if (pos === "top") return 15;
                    if (pos === "20%") return 20;
                    if (pos === "80%") return 80;
                    if (pos === "bottom") return 85;
                    return 50;
                  })()}
                  initialZoom={professionalForm.imageZoom || 100}
                  onConfirm={(offsetX, offsetY, zoom) => {
                    setProfessionalForm({
                      ...professionalForm,
                      imagePosition: `${offsetX},${offsetY}`,
                      imageZoom: zoom,
                    });
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Formazione</Label>
              <div className="flex gap-2">
                <Input
                  value={educationInput}
                  onChange={(e) => setEducationInput(e.target.value)}
                  placeholder="Es. Laurea in Giurisprudenza - Università..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEducation())}
                  data-testid="input-education"
                />
                <Button type="button" onClick={addEducation} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {professionalForm.education.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {professionalForm.education.map((edu, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {edu}
                      <button type="button" onClick={() => removeEducation(i)} className="ml-1 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Lingue</Label>
              <div className="flex gap-2">
                <Input
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  placeholder="Es. Italiano, Inglese..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                  data-testid="input-language"
                />
                <Button type="button" onClick={addLanguage} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {professionalForm.languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {professionalForm.languages.map((lang, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {lang}
                      <button type="button" onClick={() => removeLanguage(i)} className="ml-1 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeProfessionalDialog}>
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={createProfessionalMutation.isPending || updateProfessionalMutation.isPending}
                data-testid="button-submit-professional"
              >
                {createProfessionalMutation.isPending || updateProfessionalMutation.isPending
                  ? "Salvataggio..."
                  : editingProfessional
                  ? "Salva Modifiche"
                  : "Aggiungi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteProfessionalConfirm !== null} onOpenChange={() => setDeleteProfessionalConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questo professionista? L'azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteProfessionalConfirm(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteProfessionalConfirm && deleteProfessionalMutation.mutate(deleteProfessionalConfirm)}
              disabled={deleteProfessionalMutation.isPending}
              data-testid="button-confirm-delete-professional"
            >
              {deleteProfessionalMutation.isPending ? "Eliminazione..." : "Elimina"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Modifica Categoria" : "Nuova Categoria"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Modifica i dettagli della categoria." : "Crea una nuova categoria per classificare gli articoli."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome (Italiano) *</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Es. Diritto del Lavoro"
                data-testid="input-category-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryNameEn">Nome (Inglese)</Label>
              <Input
                id="categoryNameEn"
                value={categoryForm.nameEn}
                onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                placeholder="Es. Labor Law"
                data-testid="input-category-name-en"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryType">Tipo *</Label>
              <Select value={categoryForm.type} onValueChange={(v) => setCategoryForm({ ...categoryForm, type: v })}>
                <SelectTrigger data-testid="select-category-type">
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macro">Branca (Macro categoria)</SelectItem>
                  <SelectItem value="micro">Categoria (Micro categoria)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeCategoryDialog}>
                Annulla
              </Button>
              <Button
                onClick={handleCategorySubmit}
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending || !categoryForm.name}
                data-testid="button-submit-category"
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending
                  ? "Salvataggio..."
                  : editingCategory
                  ? "Salva Modifiche"
                  : "Crea"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteCategoryConfirm !== null} onOpenChange={() => setDeleteCategoryConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questa categoria? L'azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteCategoryConfirm(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteCategoryConfirm && deleteCategoryMutation.mutate(deleteCategoryConfirm)}
              disabled={deleteCategoryMutation.isPending}
              data-testid="button-confirm-delete-category"
            >
              {deleteCategoryMutation.isPending ? "Eliminazione..." : "Elimina"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
          data-testid="lightbox-overlay"
        >
          <img
            src={lightboxImage}
            alt="Anteprima"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            loading="lazy"
            decoding="async"
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white bg-black/50"
            onClick={() => setLightboxImage(null)}
            data-testid="button-close-lightbox"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
