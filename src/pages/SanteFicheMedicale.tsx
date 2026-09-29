
  const printQR = () => {
    const svg = document.getElementById("sos-qr")?.outerHTML ?? "";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Fiche d'urgence</title></head><body style="font-family:sans-serif;text-align:center;padding:40px">
      <h1>🆘 FICHE D'URGENCE</h1><p>Scannez ce QR code pour consulter les informations essentielles.</p>
      <div style="margin:24px auto;width:240px">${svg.replace(/width="\d+"/, 'width="240"').replace(/height="\d+"/, 'height="240"')}</div>
      <p style="font-size:12px;color:#555">Informations destinées à faciliter la prise en charge en cas d'urgence.</p>
      <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  const lastView = accesses.find((a) => a.event === "view");

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <button onClick={() => navigate("/sante")} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>
        <h1 className="text-2xl font-bold">🆘 Ma fiche d'urgence</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          📱 Le QR ouvre uniquement les informations que tu coches. Ton dossier médical complet reste privé 🔒
        </p>
      </SectionBlock>

      {record.public_token && (
        <SectionBlock>
          <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-semibold">Activer ma fiche d'urgence</span>
                <span className="block text-xs text-muted-foreground">{record.is_public ? "Le QR fonctionne sans connexion." : "Désactivée : le QR n'affiche plus rien."}</span>
              </span>
              <input type="checkbox" checked={record.is_public} disabled={saving} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5" aria-label="Activer ma fiche d'urgence" />
            </label>

            <div>
              <p className="text-sm font-semibold">Informations affichées</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SHAREABLE.map((s) => {
                  const on = record.shared_fields.includes(s.key);
                  return (
                    <button key={s.key} type="button" onClick={() => toggleField(s.key)} aria-pressed={on}
                      className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
                      {on ? "✓ " : ""}{s.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Jamais partagés : numéro de sécurité sociale, adresse, documents, ordonnances. Pense à enregistrer après ton choix.</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowQR(!showQR)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                <QrCode className="h-4 w-4" /> {showQR ? "Masquer le QR" : "Générer mon QR d'urgence"}
              </button>
              <button onClick={() => setShowPreview(!showPreview)} className="flex items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium">
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} Aperçu
              </button>
            </div>

            {showPreview && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Voici ce que verra une personne qui scanne ton QR.</p>
                <div className="overflow-hidden rounded-xl border border-border"><EmergencySheetView sheet={buildPreview(record)} /></div>
              </div>
            )}

            {showQR && (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-5">
                <QRCodeSVG id="sos-qr" value={publicUrl} size={200} level="M" />
                <p className="text-center text-[10px] text-muted-foreground break-all">{publicUrl}</p>
                <div className="flex w-full gap-2">
                  <button onClick={copyLink} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copié" : "Copier le lien"}
                  </button>
                  <button onClick={printQR} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium">
                    <Printer className="h-3.5 w-3.5" /> Imprimer
                  </button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1 text-[11px] text-muted-foreground underline">
                      <RefreshCw className="h-3 w-3" /> Régénérer mon QR
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" /> Régénérer le QR d'urgence ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        L'ancien QR cessera immédiatement de fonctionner. Limite : 1 régénération toutes les 5 minutes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={regenerateToken}>Confirmer et régénérer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            <div className="rounded-lg bg-background/60 p-3">
              <p className="text-xs font-semibold">🔒 Activité de ma fiche d'urgence</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {lastView ? `Dernier accès : ${new Date(lastView.accessed_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}` : "Aucun accès pour l'instant."}
              </p>
              {accesses.length > 1 && (
                <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                  {accesses.slice(1, 6).map((a, i) => (
                    <li key={i}>{new Date(a.accessed_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })} · {a.event === "view" ? "consultée" : "tentative (fiche désactivée)"}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SectionBlock>
      )}

      <SectionBlock>
        <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold">Informations personnelles</h2>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Prénom" value={record.first_name} onChange={(v) => setRecord({ ...record, first_name: v })} />
            <Field label="Nom" value={record.last_name} onChange={(v) => setRecord({ ...record, last_name: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date de naissance" type="date" value={record.birth_date || ""} onChange={(v) => setRecord({ ...record, birth_date: v })} />
            <Field label="Groupe sanguin" placeholder="A+, O-..." value={record.blood_type} onChange={(v) => setRecord({ ...record, blood_type: v })} />
          </div>
          <Field label="Numéro de sécurité sociale (privé, jamais partagé)" value={record.social_security_number} onChange={(v) => setRecord({ ...record, social_security_number: v })} />

          <h2 className="pt-2 text-sm font-bold">Médical</h2>
          <Field label="Allergies médicamenteuses" multiline value={record.allergies} onChange={(v) => setRecord({ ...record, allergies: v })} />
          <Field label="Traitements en cours" multiline value={record.current_treatments} onChange={(v) => setRecord({ ...record, current_treatments: v })} />
          <Field label="Antécédents importants" multiline value={record.medical_history} onChange={(v) => setRecord({ ...record, medical_history: v })} />
          <Field label="Informations importantes en cas d'urgence" multiline value={record.emergency_notes} onChange={(v) => setRecord({ ...record, emergency_notes: v })} />

          <h2 className="pt-2 text-sm font-bold">Contacts</h2>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Médecin traitant" value={record.doctor_name} onChange={(v) => setRecord({ ...record, doctor_name: v })} />
            <Field label="Tél médecin" type="tel" value={record.doctor_phone} onChange={(v) => setRecord({ ...record, doctor_phone: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Personne à prévenir" value={record.emergency_contact_name} onChange={(v) => setRecord({ ...record, emergency_contact_name: v })} />
            <Field label="Téléphone" type="tel" value={record.emergency_contact_phone} onChange={(v) => setRecord({ ...record, emergency_contact_phone: v })} />
          </div>

          <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer la fiche"}
          </button>
        </div>
      </SectionBlock>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; multiline?: boolean; }) => (
  <div>
    <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    )}
  </div>
);

export default SanteFicheMedicale;
