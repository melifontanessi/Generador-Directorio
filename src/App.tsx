import { useState, useMemo } from "react";
import { 
  Copy, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Search, 
  Mail, 
  Phone, 
  User, 
  Download, 
  Sparkles,
  Info,
  Edit2,
  FileCode2,
  Smartphone,
  MessageSquare
} from "lucide-react";
import { ContactCard } from "./types";
import { initialCards, initialHeroCards } from "./data";
import { generateStyleSheetHtml, generateInlineHtml } from "./generator";
import { getWhatsAppUrl, isWhatsAppPhone } from "./utils/whatsapp";

export default function App() {
  // State for contact cards
  const [cards, setCards] = useState<ContactCard[]>(initialCards);
  // State for hero cards
  const [heroCards, setHeroCards] = useState<ContactCard[]>(initialHeroCards);
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // Selected tab for preview: "preview" or "code"
  const [previewTab, setPreviewTab] = useState<"preview" | "code">("preview");
  // Chosen code generation format: "style" or "inline"
  const [codeFormat, setCodeFormat] = useState<"style" | "inline">("style");
  // State for selected card in editor (id or null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>("hero-1");
  // State to track copy notification
  const [copied, setCopied] = useState(false);

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    const q = searchQuery.toLowerCase();
    return cards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.contacts && c.contacts.toLowerCase().includes(q)) ||
        (c.emails && c.emails.some((email) => email.toLowerCase().includes(q)))
    );
  }, [cards, searchQuery]);

  // Find the currently selected card for editing from either grid cards or hero cards
  const selectedCard = useMemo(() => {
    return (
      cards.find((c) => c.id === selectedCardId) ||
      heroCards.find((c) => c.id === selectedCardId) ||
      null
    );
  }, [cards, heroCards, selectedCardId]);

  // Generate HTML code string
  const generatedCode = useMemo(() => {
    if (codeFormat === "style") {
      return generateStyleSheetHtml(heroCards, cards);
    } else {
      return generateInlineHtml(heroCards, cards);
    }
  }, [heroCards, cards, codeFormat]);

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  // Download code as HTML file
  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "informacion_util.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset to original cards
  const handleResetCards = () => {
    if (window.confirm("¿Estás seguro de que quieres restablecer el directorio al contenido original del PDF?")) {
      setCards(JSON.parse(JSON.stringify(initialCards)));
      setHeroCards(JSON.parse(JSON.stringify(initialHeroCards)));
      setSelectedCardId("hero-1");
    }
  };

  // Update card helper
  const handleUpdateCardField = (id: string, field: keyof ContactCard, value: any) => {
    if (id.startsWith("hero-")) {
      setHeroCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    } else {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    }
  };

  // Update a single email by index
  const handleUpdateEmail = (cardId: string, emailIndex: number, value: string) => {
    const updateFn = (prev: ContactCard[]) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const newEmails = [...(c.emails || [])];
        newEmails[emailIndex] = value;
        return { ...c, emails: newEmails };
      });

    if (cardId.startsWith("hero-")) {
      setHeroCards(updateFn);
    } else {
      setCards(updateFn);
    }
  };

  // Add an empty email to a card
  const handleAddEmail = (cardId: string) => {
    const updateFn = (prev: ContactCard[]) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        return { ...c, emails: [...(c.emails || []), "contacto@drogueria20dejunio.com.ar"] };
      });

    if (cardId.startsWith("hero-")) {
      setHeroCards(updateFn);
    } else {
      setCards(updateFn);
    }
  };

  // Remove an email from a card
  const handleRemoveEmail = (cardId: string, emailIndex: number) => {
    const updateFn = (prev: ContactCard[]) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const newEmails = (c.emails || []).filter((_, i) => i !== emailIndex);
        return { ...c, emails: newEmails };
      });

    if (cardId.startsWith("hero-")) {
      setHeroCards(updateFn);
    } else {
      setCards(updateFn);
    }
  };

  // Create a new blank card
  const handleCreateNewCard = () => {
    const newId = String(Date.now());
    const newCard: ContactCard = {
      id: newId,
      title: "Nueva Área / Sector",
      phone: "Interno: 100",
      emails: ["contacto@drogueria20dejunio.com.ar"]
    };
    setCards((prev) => [...prev, newCard]);
    setSelectedCardId(newId);
  };

  // Delete a card
  const handleDeleteCard = (id: string) => {
    if (id.startsWith("hero-")) {
      alert("No puedes eliminar las tarjetas superiores principales.");
      return;
    }
    if (cards.length <= 1) {
      alert("Debes mantener al menos una tarjeta de contacto.");
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCardId === id) {
      const remaining = cards.filter((c) => c.id !== id);
      setSelectedCardId(remaining[0]?.id || null);
    }
  };

  const renderStandardCard = (card: ContactCard) => {
    const isEdited = card.id === selectedCardId;
    return (
      <div
        key={card.id}
        onClick={() => setSelectedCardId(card.id)}
        className={`bg-white rounded-xl p-6 border shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative group ${
          isEdited 
            ? "ring-2 ring-indigo-500 border-transparent scale-[1.01]" 
            : "border-slate-200"
        }`}
      >
        {/* Corner Tag if selected */}
        {isEdited && (
          <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white p-0.5 rounded-full shadow-md z-10">
            <Check className="w-3.5 h-3.5" />
          </span>
        )}

        <div className="flex flex-col gap-2 h-full">
          <h3 className="font-bold text-slate-900 text-[17px] leading-tight tracking-tight">
            {card.title || "Sin título"}
          </h3>
          
          {card.subtitle && (
            <p className="text-[13px] text-slate-500 italic mt-0.5">
              {card.subtitle}
            </p>
          )}

          <div className="text-slate-600 text-[13px] leading-relaxed mt-1.5 space-y-1 flex-1">
            {card.phone && (
              <div className="flex items-start gap-1">
                {(() => {
                  const waUrl = getWhatsAppUrl(card.phone);
                  if (waUrl) {
                    return (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        {card.phone}
                      </a>
                    );
                  }
                  return <span>{card.phone}</span>;
                })()}
              </div>
            )}
            
            {card.secondaryPhone && (
              <div className="flex items-start gap-1">
                {(() => {
                  const waUrl = getWhatsAppUrl(card.secondaryPhone);
                  if (waUrl) {
                    return (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        {card.secondaryPhone}
                      </a>
                    );
                  }
                  return <span>{card.secondaryPhone}</span>;
                })()}
              </div>
            )}

            {card.contacts && (
              <div className="flex items-start gap-1 text-slate-500 text-[12px] italic">
                <span>{card.contacts}</span>
              </div>
            )}

            {card.emails && card.emails.map((email, i) => (
              <div key={i} className="flex items-start gap-1 break-all">
                <span>Email: <span className="text-indigo-600 hover:underline">{email}</span></span>
              </div>
            ))}

            {card.extraText && (
              <div className="text-[12px] text-slate-500 font-medium">
                {card.extraText}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Banner Header */}
      <header className="bg-white border-b border-slate-200 py-5 px-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Generador de Directorio
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-100">
                  Listo para Web
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Edita los datos del PDF en tiempo real. Descarga o copia el código HTML interactivo para tu plataforma.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetCards}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg"
              title="Restablecer valores predeterminados"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer
            </button>
            <button
              onClick={handleDownloadCode}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 transition-colors rounded-lg border border-indigo-200 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              Descargar .HTML
            </button>
            <button
              onClick={handleCopyCode}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 shadow-md ${
                copied 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Código HTML
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace split */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Controls & Editor (Col-5) */}
        <div className="lg:col-span-5 flex flex-col gap-5 h-full">
          
          {/* Quick Info & Instructions card */}
          <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex gap-3">
              <div className="text-indigo-600 shrink-0">
                <Info className="w-5 h-5 mt-0.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-950">¿Cómo usar este código?</h3>
                <p className="text-xs text-indigo-900/80 mt-1 leading-relaxed">
                  Copia el código generado y pégalo en la sección <strong>"HTML"</strong> o <strong>"Código Fuente"</strong> de tu editor web (WordPress, Tiendanube, etc.).
                </p>
                <div className="flex gap-4 mt-3 pt-3 border-t border-indigo-100/60">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">Formato Recomendado</span>
                    <span className="text-xs font-semibold text-indigo-950 block mt-0.5">Con Bloque Style (CSS)</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">Diseño Adaptable</span>
                    <span className="text-xs font-semibold text-indigo-950 block mt-0.5">Grid de Alta Fidelidad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Manager */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Gestionar Tarjetas</h2>
                <p className="text-slate-500 text-[11px]">Haz clic en cualquier tarjeta para editar sus textos</p>
              </div>
              <button
                onClick={handleCreateNewCard}
                className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold py-1.5 px-2.5 rounded-lg transition-colors shadow-2xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                Agregar tarjeta
              </button>
            </div>

            {/* List Header for Heroes */}
            <div className="bg-indigo-50/30 px-3.5 py-1.5 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Accesos Directos Superiores (Hero)</span>
            </div>

            {/* Hero Quick list */}
            <div className="divide-y divide-slate-100 bg-white border-b border-slate-200">
              {heroCards.map((hero) => {
                const isSelected = hero.id === selectedCardId;
                return (
                  <div
                    key={hero.id}
                    onClick={() => setSelectedCardId(hero.id)}
                    className={`p-3 text-left transition-all cursor-pointer flex items-center justify-between gap-2 border-l-2 ${
                      isSelected 
                        ? "bg-indigo-50/50 border-l-indigo-600 font-medium" 
                        : "border-l-transparent hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        {hero.title}
                      </div>
                      <div className="text-slate-500 text-[10px] truncate mt-0.5">
                        {hero.phone} {hero.emails && hero.emails.length > 0 ? `• ${hero.emails[0]}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full font-bold uppercase">SUPERIOR</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List Header for Grid */}
            <div className="bg-slate-50 px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Sectores del Directorio</span>
              {searchQuery && <span className="text-[10px] text-indigo-600 font-bold">Filtro activo</span>}
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar área, interno o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Vertical Scroll List of Grid Cards */}
            <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredCards.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No se encontraron resultados
                </div>
              ) : (
                filteredCards.map((card) => {
                  const isSelected = card.id === selectedCardId;
                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`p-3 text-left transition-all cursor-pointer flex items-center justify-between gap-2 border-l-2 ${
                        isSelected 
                          ? "bg-indigo-50/50 border-l-indigo-600 font-medium" 
                          : "border-l-transparent hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-xs truncate">
                          {card.title || "(Sin título)"}
                        </div>
                        <div className="text-slate-500 text-[10px] truncate mt-0.5">
                          {card.phone || "Sin teléfono"} {card.subtitle ? `• ${card.subtitle}` : ""}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCardId(card.id);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isSelected 
                              ? "text-indigo-600 bg-indigo-50" 
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          }`}
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(card.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Editor Form (for selected card) */}
          {selectedCard && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-50 text-amber-800 p-1 rounded-md border border-amber-100">
                    <Edit2 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Editar: <span className="text-indigo-600">{selectedCard.title}</span>
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">ID: {selectedCard.id}</span>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Título del Área</label>
                  <input
                    type="text"
                    value={selectedCard.title}
                    onChange={(e) => handleUpdateCardField(selectedCard.id, "title", e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Subtítulo / Aclaración</label>
                  <input
                    type="text"
                    value={selectedCard.subtitle || ""}
                    onChange={(e) => handleUpdateCardField(selectedCard.id, "subtitle", e.target.value)}
                    placeholder="Ej. Pago a proveedores"
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Phone and Secondary Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Teléfono / Interno</label>
                  <input
                    type="text"
                    value={selectedCard.phone || ""}
                    onChange={(e) => handleUpdateCardField(selectedCard.id, "phone", e.target.value)}
                    placeholder="Ej. Interno: 150"
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    {selectedCard.id === "hero-2" ? "Texto de Enlace" : "Teléfono Secundario / Celular"}
                  </label>
                  <input
                    type="text"
                    value={selectedCard.secondaryPhone || selectedCard.extraText || ""}
                    onChange={(e) => {
                      if (selectedCard.id === "hero-2") {
                        handleUpdateCardField(selectedCard.id, "extraText", e.target.value);
                      } else {
                        handleUpdateCardField(selectedCard.id, "secondaryPhone", e.target.value);
                      }
                    }}
                    placeholder={selectedCard.id === "hero-2" ? "Enviar mensaje" : "Ej. Celular: 3413 159336"}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Contact Person Names */}
              {selectedCard.id !== "hero-1" && selectedCard.id !== "hero-2" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Personas de Contacto</label>
                  <input
                    type="text"
                    value={selectedCard.contacts || ""}
                    onChange={(e) => handleUpdateCardField(selectedCard.id, "contacts", e.target.value)}
                    placeholder="Ej. Contacto: Fernando Boné, Bentivoglio Cintia"
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white w-full transition-all"
                  />
                </div>
              )}

              {/* Emails List */}
              {selectedCard.id !== "hero-2" && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Correos Electrónicos</label>
                    <button
                      onClick={() => handleAddEmail(selectedCard.id)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Añadir Email
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {(!selectedCard.emails || selectedCard.emails.length === 0) ? (
                      <div className="text-[11px] text-slate-400 italic">No hay correos en esta tarjeta</div>
                    ) : (
                      selectedCard.emails.map((email, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleUpdateEmail(selectedCard.id, idx, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
                          />
                          <button
                            onClick={() => handleRemoveEmail(selectedCard.id, idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Quitar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Extra info/note */}
              {selectedCard.id !== "hero-1" && selectedCard.id !== "hero-2" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Información Extra (Opcional)</label>
                  <input
                    type="text"
                    value={selectedCard.extraText || ""}
                    onChange={(e) => handleUpdateCardField(selectedCard.id, "extraText", e.target.value)}
                    placeholder="Ej. Atención de 8 a 16 hs o Contact Center Opción 5"
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right column: Interactive Visual Preview or Live Code View (Col-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full">
          
          {/* Tabs header & Selector */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* View Tab selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setPreviewTab("preview")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  previewTab === "preview" 
                    ? "bg-white text-slate-900 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-4 h-4 text-indigo-600" />
                Vista Previa Real
              </button>
              <button
                onClick={() => setPreviewTab("code")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  previewTab === "code" 
                    ? "bg-white text-slate-900 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code className="w-4 h-4 text-indigo-600" />
                Código HTML/CSS
              </button>
            </div>

            {/* Code output style selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Formato de Código:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setCodeFormat("style")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                    codeFormat === "style"
                      ? "bg-white text-indigo-700 shadow-3xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Genera un bloque <style> arriba y clases CSS limpias en cada etiqueta"
                >
                  Con &lt;style&gt;
                </button>
                <button
                  onClick={() => setCodeFormat("inline")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                    codeFormat === "inline"
                      ? "bg-white text-indigo-700 shadow-3xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Coloca todos los estilos en línea directamente en el atributo style='...'"
                >
                  Estilos Inline
                </button>
              </div>
            </div>
          </div>

          {/* Main Visual Display area */}
          <div className="bg-slate-200/60 rounded-3xl border border-slate-200 p-4 shadow-inner min-h-[400px] flex flex-col justify-between overflow-hidden relative">
            
            {/* If Preview mode selected */}
            {previewTab === "preview" ? (
              <div className="flex-1 overflow-y-auto max-h-[680px] pr-1">
                <div className="bg-[#f1f5f9] p-6 md:p-8 rounded-2xl shadow-xs max-w-4xl mx-auto border border-slate-300/40">
                  
                  {/* Embedded Header in the preview matching PDF exactly */}
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                      Contactos internos
                    </h2>
                  </div>

                  {/* Two Hero Cards row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    
                    {/* Atención al cliente Hero */}
                    {(() => {
                      const hero1 = heroCards.find(c => c.id === "hero-1") || heroCards[0];
                      const isEdited = selectedCardId === hero1.id;
                      return (
                        <div
                          onClick={() => setSelectedCardId(hero1.id)}
                          className={`bg-white rounded-xl p-6 border shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-5 cursor-pointer relative ${
                            isEdited ? "ring-2 ring-indigo-500 border-transparent scale-[1.01]" : "border-slate-200"
                          }`}
                        >
                          <div className="w-14 h-14 rounded-full bg-[#0091ff] flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-200">
                            <MessageSquare className="w-7 h-7 stroke-[2.5]" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <h3 className="font-bold text-slate-900 text-lg md:text-xl leading-tight">
                              {hero1.title}
                            </h3>
                            <div className="text-sm font-semibold text-slate-700">{hero1.phone}</div>
                            {hero1.emails && hero1.emails.map((email, idx) => (
                              <div key={idx} className="text-xs text-indigo-600 hover:underline">
                                {email}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Express20 Hero */}
                    {(() => {
                      const hero2 = heroCards.find(c => c.id === "hero-2") || heroCards[1];
                      const isEdited = selectedCardId === hero2.id;
                      const waUrl = getWhatsAppUrl(hero2.phone) || `https://wa.me/${hero2.phone.replace(/[^0-9]/g, "")}`;
                      return (
                        <div
                          onClick={() => setSelectedCardId(hero2.id)}
                          className={`bg-white rounded-xl p-6 border shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-5 cursor-pointer relative ${
                            isEdited ? "ring-2 ring-indigo-500 border-transparent scale-[1.01]" : "border-slate-200"
                          }`}
                        >
                          <div className="shrink-0">
                            <div className="text-2xl font-black italic text-[#0091ff] tracking-tighter select-none">
                              Express<span className="text-[#0a40a4] font-black">20</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-semibold text-slate-700">
                              <a 
                                href={waUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()} 
                                className="hover:text-indigo-600 hover:underline transition-colors"
                              >
                                {hero2.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-4.5 h-4.5 rounded-full bg-[#25d366] text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                              <a 
                                href={waUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()} 
                                className="text-sm font-bold text-[#25d366] hover:underline"
                              >
                                {hero2.extraText || "Enviar mensaje"}
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>

                  {/* Section: Ejecutivos comerciales */}
                  {(() => {
                    const filteredEjecutivos = filteredCards.filter(c => c.subtitle === "Ejecutivo de cuentas");
                    if (filteredEjecutivos.length === 0) return null;
                    return (
                      <div className="mb-10">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Ejecutivos comerciales
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredEjecutivos.map(renderStandardCard)}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Section: Sectores e Internos */}
                  {(() => {
                    const filteredOtros = filteredCards.filter(c => c.subtitle !== "Ejecutivo de cuentas");
                    if (filteredOtros.length === 0) return null;
                    return (
                      <div>
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Sectores e Internos
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredOtros.map(renderStandardCard)}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>
            ) : (
              /* If HTML Code view selected */
              <div className="flex-1 flex flex-col h-full bg-[#1e293b] rounded-2xl overflow-hidden shadow-xs relative">
                {/* Header toolbar for code box */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 ml-2">
                      {codeFormat === "style" ? "informacion_util.html (Hoja de Estilos)" : "informacion_util.html (Inline)"}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors py-1 px-2.5 rounded-md"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        Copiar código
                      </>
                    )}
                  </button>
                </div>

                {/* Preformatted code block */}
                <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 select-all leading-relaxed max-h-[500px]">
                  <pre className="whitespace-pre">{generatedCode}</pre>
                </div>
              </div>
            )}

            {/* floating instructions alert bottom */}
            <div className="mt-4 bg-white/95 backdrop-blur-xs border border-slate-200/85 p-3 rounded-xl flex items-center justify-between gap-4 text-xs shadow-xs shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-slate-600 font-medium">
                  {codeFormat === "style" 
                    ? "Formato recomendado para la mayoría de editores: HTML estructurado y clases CSS."
                    : "Formato inline para máxima compatibilidad con creadores de correos o sistemas legacy."}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 shrink-0 flex items-center gap-1"
              >
                {copied ? "Copiado ✔" : "Copiar Ahora →"}
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-6 border-t border-slate-800 mt-12 text-center">
        <div className="max-w-7xl mx-auto">
          <p className="font-medium text-slate-300">
            Droguería 20 de Junio — Panel de Contactos Internos
          </p>
          <p className="mt-1 text-slate-500">
            Diseño fiel al original con mejoras de accesibilidad y enlaces interactivos para correo y teléfono.
          </p>
        </div>
      </footer>
    </div>
  );
}
