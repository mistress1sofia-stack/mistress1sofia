import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CURRENCIES, CURRENCY_SYMBOL, type Currency } from "@/lib/pricing";

// Site language + display currency. English is the source text; German and French are looked up
// by the exact English sentence. Anything missing from the table simply shows in English.
export type Lang = "en" | "de" | "fr";
const LANGS: Lang[] = ["en", "de", "fr"];
type Prefs = { lang: Lang; currency: Currency };
type Vars = Record<string, string | number>;
const PREFS_KEY = "ms-prefs";
const EURO_REGIONS = new Set(["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SK", "SI"]);

// [German, French]
const D: Record<string, [string, string]> = {
  // ---- Header, footer, switcher
  "About": ["Über mich", "À propos"],
  "Offerings": ["Angebot", "Prestations"],
  "Boundaries": ["Grenzen", "Limites"],
  "Protocol & FAQ": ["Protokoll & FAQ", "Protocole & FAQ"],
  "Apply to Serve": ["Bewerbung zum Dienen", "Postuler pour servir"],
  "Book a Session": ["Session buchen", "Réserver une séance"],
  "Privacy Notice": ["Datenschutzerklärung", "Politique de confidentialité"],
  "Close": ["Schließen", "Fermer"],
  "Menu": ["Menü", "Menu"],
  "Close menu": ["Menü schließen", "Fermer le menu"],
  "Open menu": ["Menü öffnen", "Ouvrir le menu"],
  "Language": ["Sprache", "Langue"],
  "Currency": ["Währung", "Devise"],
  "Professional Dominatrix. Selective. Discreet. Uncompromising.": ["Professionelle Domina. Selektiv. Diskret. Kompromisslos.", "Dominatrice professionnelle. Sélective. Discrète. Intransigeante."],
  "Strictly 18+ adults only. All interactions are consensual, negotiated in advance, and conducted between adults.": ["Strikt nur für Erwachsene ab 18. Alle Begegnungen sind einvernehmlich, im Voraus vereinbart und finden zwischen Erwachsenen statt.", "Strictement réservé aux adultes de 18 ans et plus. Toutes les interactions sont consenties, négociées à l'avance et entre adultes."],
  "Applications and booking requests are stored privately and reviewed only by Mistress Sofia. You may request deletion of your data at any time.": ["Bewerbungen und Buchungsanfragen werden privat gespeichert und nur von Mistress Sofia geprüft. Sie können jederzeit die Löschung Ihrer Daten verlangen.", "Les candidatures et demandes de réservation sont conservées de manière privée et examinées uniquement par Mistress Sofia. Vous pouvez demander la suppression de vos données à tout moment."],
  "© {year} Mistress Sofia. All rights reserved.": ["© {year} Mistress Sofia. Alle Rechte vorbehalten.", "© {year} Mistress Sofia. Tous droits réservés."],
  // ---- Age gate
  "Restricted Access": ["Eingeschränkter Zugang", "Accès restreint"],
  "Adults Only (18+)": ["Nur für Erwachsene (18+)", "Réservé aux adultes (18+)"],
  "This site contains mature themes intended for adults. Please confirm you are at least 18 years of age (or of legal age in your jurisdiction) to proceed.": ["Diese Website enthält Inhalte für ein erwachsenes Publikum. Bitte bestätigen Sie, dass Sie mindestens 18 Jahre alt sind (oder nach dem Recht Ihres Landes volljährig), um fortzufahren.", "Ce site aborde des thèmes pour adultes. Veuillez confirmer que vous avez au moins 18 ans (ou l'âge légal dans votre pays) pour continuer."],
  "I Am 18 or Older — Enter": ["Ich bin 18 oder älter – Eintreten", "J'ai 18 ans ou plus — Entrer"],
  "Exit / Leave": ["Verlassen", "Quitter"],
  // ---- Form kit
  "Step {n} of {total}": ["Schritt {n} von {total}", "Étape {n} sur {total}"],
  "Gift Card": ["Geschenkkarte", "Carte cadeau"],
  "Currently Unavailable": ["Derzeit nicht verfügbar", "Actuellement indisponible"],
  "Preferred Payment Method": ["Bevorzugte Zahlungsmethode", "Mode de paiement préféré"],
  "No payment is taken through this site. Never send card codes, card photos, or wallet details here — if your request is accepted, payment instructions are arranged privately and confirmed before anything is due.": ["Über diese Website wird keine Zahlung abgewickelt. Senden Sie hier niemals Kartencodes, Kartenfotos oder Wallet-Daten – wird Ihre Anfrage angenommen, werden die Zahlungsanweisungen privat vereinbart und bestätigt, bevor etwas fällig wird.", "Aucun paiement n'est effectué via ce site. N'envoyez jamais ici de codes de carte, de photos de carte ou d'informations de portefeuille — si votre demande est acceptée, les instructions de paiement sont convenues en privé et confirmées avant qu'un paiement ne soit dû."],
  "What you enter here is sent to a private inbox that only Mistress Sofia can access, and is used solely to consider your request. It is never published, sold, or shared. Declined requests are deleted within 24 hours of the decision; undecided requests are deleted automatically after 90 days. You may ask for your submission to be deleted at any time by emailing": ["Ihre Eingaben werden an ein privates Postfach gesendet, auf das nur Mistress Sofia Zugriff hat, und dienen ausschließlich der Prüfung Ihrer Anfrage. Sie werden nie veröffentlicht, verkauft oder weitergegeben. Abgelehnte Anfragen werden innerhalb von 24 Stunden nach der Entscheidung gelöscht; unentschiedene Anfragen werden nach 90 Tagen automatisch gelöscht. Sie können jederzeit die Löschung Ihrer Eingabe verlangen, indem Sie eine E-Mail an", "Ce que vous saisissez ici est envoyé dans une boîte privée accessible uniquement à Mistress Sofia, et sert uniquement à examiner votre demande. Ces informations ne sont jamais publiées, vendues ni partagées. Les demandes refusées sont supprimées dans les 24 heures suivant la décision ; les demandes en attente sont supprimées automatiquement après 90 jours. Vous pouvez demander la suppression de votre envoi à tout moment en écrivant à"],
  "with your reference ID. Read the full": ["mit Ihrer Referenznummer senden. Lesen Sie die vollständige", "en indiquant votre numéro de référence. Consultez la"],
  "privacy notice": ["Datenschutzerklärung", "politique de confidentialité"],
  "I consent to my answers being stored privately and reviewed by Mistress Sofia, as described in the privacy notice above.": ["Ich willige ein, dass meine Angaben privat gespeichert und von Mistress Sofia geprüft werden, wie in der obigen Datenschutzerklärung beschrieben.", "J'accepte que mes réponses soient conservées de manière privée et examinées par Mistress Sofia, comme décrit dans la politique de confidentialité ci-dessus."],
  "I consent to Mistress Sofia storing the health, limits and preference details I have entered, for the sole purpose of considering my request.": ["Ich willige ein, dass Mistress Sofia die von mir angegebenen Gesundheits-, Grenzen- und Vorlieben-Angaben ausschließlich zur Prüfung meiner Anfrage speichert.", "J'accepte que Mistress Sofia conserve les informations de santé, de limites et de préférences que j'ai saisies, dans le seul but d'examiner ma demande."],
  "Try Again": ["Erneut versuchen", "Réessayer"],
  "Back": ["Zurück", "Retour"],
  "Sending…": ["Wird gesendet…", "Envoi…"],
  "Submit": ["Absenden", "Envoyer"],
  "Continue": ["Weiter", "Continuer"],
  "Received": ["Eingegangen", "Reçu"],
  "Reference ID": ["Referenznummer", "Numéro de référence"],
  "Begin": ["Beginnen", "Commencer"],
  "Submit Request": ["Anfrage absenden", "Envoyer la demande"],
  "Submit Application": ["Bewerbung absenden", "Envoyer la candidature"],
  "Select…": ["Auswählen…", "Choisir…"],
  "Edit": ["Bearbeiten", "Modifier"],
  "Your progress is kept only in this browser tab.": ["Ihr Fortschritt wird nur in diesem Browser-Tab gespeichert.", "Votre progression n'est conservée que dans cet onglet du navigateur."],
  // ---- Validation messages
  "Required": ["Erforderlich", "Obligatoire"],
  "Enter a valid email": ["Geben Sie eine gültige E-Mail-Adresse ein", "Saisissez une adresse e-mail valide"],
  "You must be 18 or older": ["Sie müssen mindestens 18 Jahre alt sein", "Vous devez avoir 18 ans ou plus"],
  "Enter number of hours": ["Anzahl der Stunden eingeben", "Saisissez le nombre d'heures"],
  "Select a payment method": ["Wählen Sie eine Zahlungsmethode", "Choisissez un mode de paiement"],
  "Consent is required to submit": ["Zum Absenden ist Ihre Einwilligung erforderlich", "Votre consentement est requis pour envoyer"],
  "Please write at least a few sentences": ["Bitte schreiben Sie mindestens ein paar Sätze", "Veuillez écrire au moins quelques phrases"],
  "Minimum tribute is {min}": ["Der Mindesttribut beträgt {min}", "Le tribut minimum est de {min}"],
  "Your request could not be sent. Your answers are still here — please try again.": ["Ihre Anfrage konnte nicht gesendet werden. Ihre Antworten sind noch hier – bitte versuchen Sie es erneut.", "Votre demande n'a pas pu être envoyée. Vos réponses sont toujours là — veuillez réessayer."],
  "Your application could not be sent. Your answers are still here — please try again.": ["Ihre Bewerbung konnte nicht gesendet werden. Ihre Antworten sind noch hier – bitte versuchen Sie es erneut.", "Votre candidature n'a pas pu être envoyée. Vos réponses sont toujours là — veuillez réessayer."],
  // ---- Home page
  "Professional Dominatrix": ["Professionelle Domina", "Dominatrice professionnelle"],
  "Mature. Sensual. Sadistic.": ["Reif. Sinnlich. Sadistisch.", "Mûre. Sensuelle. Sadique."],
  "Portrait of Mistress Sofia in a black gown and cap, holding a wooden cane": ["Porträt von Mistress Sofia in schwarzem Talar und Barett, einen Holzstock haltend", "Portrait de Mistress Sofia en toge noire et toque, tenant une canne en bois"],
  "I Do Not Suffer Fools": ["Ich dulde keine Narren", "Je ne tolère pas les imbéciles"],
  "I am Mistress Sofia — a mature, sensual, yet deeply Sadistic Dominatrix. I have spent many years training and controlling devoted slaves. Some arrived resistant. None remained so.": ["Ich bin Mistress Sofia – eine reife, sinnliche und zugleich zutiefst sadistische Domina. Ich habe viele Jahre damit verbracht, ergebene Sklaven zu erziehen und zu beherrschen. Manche kamen widerspenstig. Keiner blieb es.", "Je suis Mistress Sofia — une dominatrice mûre, sensuelle et profondément sadique. J'ai passé de nombreuses années à dresser et à contrôler des esclaves dévoués. Certains sont arrivés réticents. Aucun ne l'est resté."],
  "I can be cold, demanding, and unrelenting — and still you will find yourself devoted to Me. I do not suffer fools. I expect obedience, discipline, and complete honesty.": ["Ich kann kalt, fordernd und unnachgiebig sein – und dennoch werden Sie sich Mir hingeben. Ich dulde keine Narren. Ich erwarte Gehorsam, Disziplin und vollständige Ehrlichkeit.", "Je peux être froide, exigeante et implacable — et pourtant vous vous retrouverez dévoué à Moi. Je ne tolère pas les imbéciles. J'exige obéissance, discipline et honnêteté totale."],
  "I am at My best with a cane in My hand or a slave beneath My boots. I will push limits, enforce standards, and demand excellence.": ["Am besten bin Ich mit einem Rohrstock in der Hand oder einem Sklaven unter Meinen Stiefeln. Ich werde Grenzen verschieben, Maßstäbe durchsetzen und Exzellenz verlangen.", "Je suis au sommet de Mon art avec une canne à la main ou un esclave sous Mes bottes. Je repousserai les limites, imposerai des standards et exigerai l'excellence."],
  "New submissives may find My maturity guiding, but never soft. I expect those who serve Me to be tested and refined.": ["Neue Submissive empfinden Meine Reife vielleicht als führend, aber niemals als weich. Ich erwarte, dass jene, die Mir dienen, geprüft und geläutert werden.", "Les nouveaux soumis trouveront peut-être Ma maturité guidante, mais jamais tendre. J'attends de ceux qui Me servent qu'ils soient mis à l'épreuve et affinés."],
  "What I Offer": ["Was Ich biete", "Ce que Je propose"],
  "Disciplines & Offerings": ["Disziplinen & Angebote", "Disciplines & prestations"],
  "Tie & tease, hogtie": ["Fesseln & Reizen, Hogtie", "Attacher & taquiner, hogtie"],
  "Sissy training, humiliation & degradation": ["Sissy-Training, Demütigung & Erniedrigung", "Dressage sissy, humiliation & avilissement"],
  "Foot, shoe & boot worship": ["Fuß-, Schuh- & Stiefelverehrung", "Vénération des pieds, chaussures & bottes"],
  "Bondage & restraint": ["Bondage & Fixierung", "Bondage & contrainte"],
  "Nipple torture": ["Nippelfolter", "Torture des tétons"],
  "Breath play": ["Atemspiele", "Jeux de respiration"],
  "Face slapping": ["Ohrfeigen", "Gifles"],
  "Role play": ["Rollenspiele", "Jeux de rôle"],
  "Flogging, whipping, spanking, paddling & caning": ["Auspeitschen, Peitschen, Spanking, Paddeln & Rohrstock", "Flagellation, fouet, fessées, paddle & canne"],
  "Chastity keyholding & orgasm control": ["Keuschhaltung (Keyholding) & Orgasmuskontrolle", "Chasteté (keyholding) & contrôle de l'orgasme"],
  "Feminization & pet training": ["Feminisierung & Pet-Training", "Féminisation & dressage de pet"],
  "Wax play, deep heat, ice play": ["Wachsspiele, Wärmesalbe, Eisspiele", "Jeux de cire, chaleur intense, jeux de glace"],
  "Electric stimulation": ["Elektrostimulation", "Électrostimulation"],
  "Sensory deprivation & solitary confinement": ["Sensorische Deprivation & Isolationshaft", "Privation sensorielle & isolement"],
  "Tickle torture & foot caning": ["Kitzelfolter & Fußbastonade", "Torture par chatouilles & bastonnade des pieds"],
  "Needle play & stapling": ["Nadelspiele & Tackern", "Jeux d'aiguilles & agrafage"],
  "What I Do Not Offer": ["Was Ich nicht anbiete", "Ce que Je ne propose pas"],
  "Strict Non-Negotiable Boundaries": ["Strikte, nicht verhandelbare Grenzen", "Limites strictes et non négociables"],
  "Bodily worship of any kind except My feet": ["Körperverehrung jeder Art außer Meiner Füße", "Vénération corporelle de toute sorte, sauf Mes pieds"],
  "Smoking": ["Rauchen", "Fumer"],
  "Anal play": ["Anales Spiel", "Jeux anaux"],
  "Hand relief (Self-touch only under My direct command)": ["Handentspannung (Selbstberührung nur auf Meinen direkten Befehl)", "Soulagement manuel (auto-contact uniquement sur Mon ordre direct)"],
  "Protocol, Rates & Screening": ["Protokoll, Preise & Auswahl", "Protocole, tarifs & sélection"],
  "Before You Approach": ["Bevor Sie sich nähern", "Avant de vous approcher"],
  "What is the difference between applying to serve and booking a session?": ["Was ist der Unterschied zwischen einer Bewerbung zum Dienen und einer Session-Buchung?", "Quelle est la différence entre postuler pour servir et réserver une séance ?"],
  "A session is a single, paid private appointment. Applying to serve is a request for long-term ownership and training — highly selective, screened carefully, and never guaranteed.": ["Eine Session ist ein einzelner, bezahlter privater Termin. Die Bewerbung zum Dienen ist eine Anfrage auf langfristige Besitznahme und Erziehung – äußerst selektiv, sorgfältig geprüft und niemals garantiert.", "Une séance est un rendez-vous privé unique et payant. Postuler pour servir est une demande de possession et de dressage à long terme — très sélective, soigneusement examinée et jamais garantie."],
  "What are the session rates?": ["Wie hoch sind die Preise?", "Quels sont les tarifs ?"],
  "1 hour: {a}  ·  1.5 hours: {b}  ·  Overnight (in person): {c}. Custom durations may be arranged.": ["1 Stunde: {a}  ·  1,5 Stunden: {b}  ·  Über Nacht (vor Ort): {c}. Individuelle Dauern können vereinbart werden.", "1 heure : {a}  ·  1,5 heure : {b}  ·  Nuit (en personne) : {c}. Des durées personnalisées peuvent être convenues."],
  "Is a deposit or tribute required?": ["Ist eine Anzahlung oder ein Tribut erforderlich?", "Un acompte ou un tribut est-il exigé ?"],
  "Yes. A mandatory 50% deposit secures any session. Applications for consideration include an administrative tribute, a demonstration of your seriousness and respect. The more generous and respectful the offering, the more seriously your application will be considered.": ["Ja. Eine verbindliche Anzahlung von 50 % sichert jede Session. Bewerbungen enthalten einen administrativen Tribut, eine Demonstration Ihrer Ernsthaftigkeit und Ihres Respekts. Je großzügiger und respektvoller die Gabe, desto ernsthafter wird Ihre Bewerbung geprüft.", "Oui. Un acompte obligatoire de 50 % garantit toute séance. Les candidatures comportent un tribut administratif, une démonstration de votre sérieux et de votre respect. Plus l'offrande est généreuse et respectueuse, plus votre candidature sera prise au sérieux."],
  "How does the screening / application process work?": ["Wie läuft die Auswahl bzw. Bewerbung ab?", "Comment fonctionne le processus de sélection / candidature ?"],
  "Complete the relevant form honestly and in full. I review every submission personally. If you are deemed suitable, you will be contacted discreetly with next steps.": ["Füllen Sie das jeweilige Formular ehrlich und vollständig aus. Ich prüfe jede Einsendung persönlich. Wenn Sie als geeignet erachtet werden, werden Sie diskret mit den nächsten Schritten kontaktiert.", "Remplissez le formulaire concerné honnêtement et intégralement. J'examine personnellement chaque demande. Si vous êtes jugé apte, vous serez contacté discrètement pour les prochaines étapes."],
  "Do you accept beginners?": ["Nehmen Sie Anfänger an?", "Acceptez-vous les débutants ?"],
  "Yes. New submissives will find My maturity guiding — but never soft. Honesty about your experience is required.": ["Ja. Neue Submissive werden Meine Reife als führend empfinden – aber niemals als weich. Ehrlichkeit über Ihre Erfahrung ist erforderlich.", "Oui. Les nouveaux soumis trouveront Ma maturité guidante — mais jamais tendre. L'honnêteté sur votre expérience est exigée."],
  "Where do sessions take place?": ["Wo finden die Sessions statt?", "Où se déroulent les séances ?"],
  "In a private, discreet dungeon, a vetted hotel, or online via an agreed platform.": ["In einem privaten, diskreten Studio, einem geprüften Hotel oder online über eine vereinbarte Plattform.", "Dans un donjon privé et discret, un hôtel sélectionné, ou en ligne via une plateforme convenue."],
  "What protocol is expected from a submissive?": ["Welches Protokoll wird von einem Submissiven erwartet?", "Quel protocole attend-on d'un soumis ?"],
  "Punctuality, cleanliness, respect, complete honesty about limits and health, and obedience. Address Me as Mistress at all times.": ["Pünktlichkeit, Sauberkeit, Respekt, vollständige Ehrlichkeit über Grenzen und Gesundheit sowie Gehorsam. Sprechen Sie Mich stets mit „Herrin“ an.", "Ponctualité, propreté, respect, honnêteté totale sur les limites et la santé, et obéissance. Adressez-vous à Moi en disant « Maîtresse » en tout temps."],
  "Kneel, or Leave.": ["Knien Sie – oder gehen Sie.", "À genoux, ou partez."],
  // ---- Booking form
  "Private Sessions": ["Private Sessions", "Séances privées"],
  "Protocol": ["Protokoll", "Protocole"],
  "Client Profile": ["Kundenprofil", "Profil du client"],
  "Session": ["Session", "Séance"],
  "Venue & Logistics": ["Ort & Logistik", "Lieu & logistique"],
  "Limits": ["Grenzen", "Limites"],
  "Deposit": ["Anzahlung", "Acompte"],
  "Review": ["Überprüfung", "Récapitulatif"],
  "Flogging & caning": ["Auspeitschen & Rohrstock", "Flagellation & canne"],
  "Humiliation": ["Demütigung", "Humiliation"],
  "Chastity & orgasm control": ["Keuschheit & Orgasmuskontrolle", "Chasteté & contrôle de l'orgasme"],
  "Feminization": ["Feminisierung", "Féminisation"],
  "Wax & ice play": ["Wachs- & Eisspiele", "Jeux de cire & de glace"],
  "Sensory deprivation": ["Sensorische Deprivation", "Privation sensorielle"],
  "Full Name": ["Vollständiger Name", "Nom complet"],
  "Pet Name": ["Pet-Name (Kosename)", "Pet name (surnom)"],
  "Email": ["E-Mail", "E-mail"],
  "Contact Number": ["Kontaktnummer", "Numéro de contact"],
  "Age": ["Alter", "Âge"],
  "Location": ["Standort", "Localisation"],
  "Session Type": ["Session-Art", "Type de séance"],
  "In-Person": ["Vor Ort", "En personne"],
  "Online": ["Online", "En ligne"],
  "Duration": ["Dauer", "Durée"],
  "Custom Hours": ["Individuelle Stunden", "Heures personnalisées"],
  "1 Hour": ["1 Stunde", "1 heure"],
  "1.5 Hours": ["1,5 Stunden", "1,5 heure"],
  "Overnight": ["Über Nacht", "Nuit"],
  "{p}/hr": ["{p}/Std.", "{p}/h"],
  "Number of Hours": ["Anzahl der Stunden", "Nombre d'heures"],
  "Session Total": ["Gesamtpreis der Session", "Total de la séance"],
  "Preferred Venue": ["Bevorzugter Ort", "Lieu préféré"],
  "Private dungeon": ["Privates Studio", "Donjon privé"],
  "Vetted hotel": ["Geprüftes Hotel", "Hôtel sélectionné"],
  "Travel details — how far will you travel, and from where?": ["Reisedetails – wie weit werden Sie reisen, und von wo?", "Détails du déplacement — jusqu'où voyagerez-vous, et d'où ?"],
  "Travel Details": ["Reisedetails", "Détails du déplacement"],
  "Platform Preference": ["Bevorzugte Plattform", "Plateforme préférée"],
  "Platform": ["Plattform", "Plateforme"],
  "Your username or ID on that platform": ["Ihr Benutzername oder Ihre ID auf dieser Plattform", "Votre nom d'utilisateur ou identifiant sur cette plateforme"],
  "Your Username on that Platform": ["Ihr Benutzername auf dieser Plattform", "Votre nom d'utilisateur sur cette plateforme"],
  "Your time zone (for example GMT+1 or New York)": ["Ihre Zeitzone (zum Beispiel GMT+1 oder New York)", "Votre fuseau horaire (par exemple GMT+1 ou New York)"],
  "Your Time Zone": ["Ihre Zeitzone", "Votre fuseau horaire"],
  "Device & connection — camera, microphone, and a private space (optional)": ["Gerät & Verbindung – Kamera, Mikrofon und ein privater Raum (optional)", "Appareil & connexion — caméra, microphone et un lieu privé (facultatif)"],
  "Device & Connection": ["Gerät & Verbindung", "Appareil & connexion"],
  "Preferred Dates & Times": ["Bevorzugte Termine & Zeiten", "Dates et heures préférées"],
  "Experience Level": ["Erfahrungsstufe", "Niveau d'expérience"],
  "Complete beginner": ["Absoluter Anfänger", "Débutant complet"],
  "Some experience": ["Etwas Erfahrung", "Un peu d'expérience"],
  "Experienced": ["Erfahren", "Expérimenté"],
  "Highly experienced": ["Sehr erfahren", "Très expérimenté"],
  "Previous professional dungeon experience (optional)": ["Frühere Erfahrung in professionellen Studios (optional)", "Expérience antérieure en donjon professionnel (facultatif)"],
  "Previous Dungeon Experience": ["Frühere Studio-Erfahrung", "Expérience antérieure en donjon"],
  "Activities Wishlist": ["Wunschliste der Aktivitäten", "Liste d'activités souhaitées"],
  "Hard Limits": ["Harte Grenzen", "Limites absolues"],
  "Soft Limits": ["Weiche Grenzen", "Limites souples"],
  "Medical / Health Alerts (optional — share only what affects safety)": ["Medizinische / gesundheitliche Hinweise (optional – nur, was die Sicherheit betrifft)", "Alertes médicales / de santé (facultatif — ne partagez que ce qui touche à la sécurité)"],
  "Medical / Health Alerts": ["Medizinische / gesundheitliche Hinweise", "Alertes médicales / de santé"],
  "50% Deposit": ["50 % Anzahlung", "Acompte de 50 %"],
  "Payment Method": ["Zahlungsmethode", "Mode de paiement"],
  "Bookings are strictly tentative until the 50% deposit has been arranged and confirmed privately.": ["Buchungen sind strikt unverbindlich, bis die Anzahlung von 50 % privat vereinbart und bestätigt wurde.", "Les réservations sont strictement provisoires tant que l'acompte de 50 % n'a pas été convenu et confirmé en privé."],
  "A private session is time spent entirely under My control. Arrive punctual, clean, and honest.": ["Eine private Session ist Zeit, die vollständig unter Meiner Kontrolle verbracht wird. Erscheinen Sie pünktlich, sauber und ehrlich.", "Une séance privée est un temps passé entièrement sous Mon contrôle. Arrivez ponctuel, propre et honnête."],
  "Limits are discussed before we begin and respected absolutely. Everything else is Mine to decide.": ["Grenzen werden vor Beginn besprochen und absolut respektiert. Alles andere entscheide Ich.", "Les limites sont discutées avant de commencer et respectées absolument. Tout le reste, c'est à Moi d'en décider."],
  "Rates: 1 hour {a} · 1.5 hours {b} · Overnight (in person only) {c}. A 50% deposit secures your booking, arranged privately once your request is accepted — nothing is paid through this site.": ["Preise: 1 Stunde {a} · 1,5 Stunden {b} · Über Nacht (nur vor Ort) {c}. Eine Anzahlung von 50 % sichert Ihre Buchung und wird privat vereinbart, sobald Ihre Anfrage angenommen wurde – über diese Website wird nichts bezahlt.", "Tarifs : 1 heure {a} · 1,5 heure {b} · Nuit (en personne uniquement) {c}. Un acompte de 50 % garantit votre réservation ; il est convenu en privé une fois votre demande acceptée — rien n'est payé via ce site."],
  "Your Request Has Been Received": ["Ihre Anfrage ist eingegangen", "Votre demande a bien été reçue"],
  "Session total {price} · 50% deposit {deposit}. This confirms receipt only — your booking is not yet confirmed. If accepted, you will be contacted privately to arrange the deposit and final details.": ["Gesamtpreis {price} · 50 % Anzahlung {deposit}. Dies bestätigt nur den Eingang – Ihre Buchung ist noch nicht bestätigt. Bei Annahme werden Sie privat kontaktiert, um die Anzahlung und die letzten Details zu vereinbaren.", "Total de la séance {price} · acompte de 50 % {deposit}. Ceci confirme uniquement la réception — votre réservation n'est pas encore confirmée. Si elle est acceptée, vous serez contacté en privé pour convenir de l'acompte et des derniers détails."],
  // ---- Application form
  "Long-Term Service": ["Langfristiger Dienst", "Service à long terme"],
  "Apply for Consideration": ["Bewerbung zur Prüfung", "Candidature pour examen"],
  "Introduction": ["Einführung", "Introduction"],
  "Personal Details": ["Persönliche Angaben", "Informations personnelles"],
  "Background": ["Hintergrund", "Parcours"],
  "Tribute": ["Tribut", "Tribut"],
  "Commitment": ["Verpflichtung", "Engagement"],
  "Phone": ["Telefon", "Téléphone"],
  "City / Country": ["Stadt / Land", "Ville / Pays"],
  "Sex": ["Geschlecht", "Sexe"],
  "Male": ["Männlich", "Homme"],
  "Female": ["Weiblich", "Femme"],
  "Non-binary": ["Nicht-binär", "Non binaire"],
  "Other": ["Andere", "Autre"],
  "Marital Status": ["Familienstand", "Situation familiale"],
  "Marital Status (optional)": ["Familienstand (optional)", "Situation familiale (facultatif)"],
  "Single": ["Ledig", "Célibataire"],
  "In a relationship": ["In einer Beziehung", "En couple"],
  "Married": ["Verheiratet", "Marié"],
  "Divorced": ["Geschieden", "Divorcé"],
  "Prefer not to say": ["Keine Angabe", "Préfère ne pas répondre"],
  "Height": ["Größe", "Taille"],
  "Height (optional)": ["Größe (optional)", "Taille (facultatif)"],
  "Weight": ["Gewicht", "Poids"],
  "Weight (optional)": ["Gewicht (optional)", "Poids (facultatif)"],
  "Education": ["Ausbildung", "Formation"],
  "Education (optional)": ["Ausbildung (optional)", "Formation (facultatif)"],
  "Occupation": ["Beruf", "Profession"],
  "Tribute Amount ({sym})": ["Tributbetrag ({sym})", "Montant du tribut ({sym})"],
  "Why you seek to serve": ["Warum Sie dienen möchten", "Pourquoi vous souhaitez servir"],
  "Obedience & honesty": ["Gehorsam & Ehrlichkeit", "Obéissance & honnêteté"],
  "Confirmed": ["Bestätigt", "Confirmé"],
  "An Offering of Respect": ["Eine Gabe des Respekts", "Une offrande de respect"],
  "The administrative tribute is not a fee. It is your first demonstration of seriousness, respect, and an understanding of your place.": ["Der administrative Tribut ist keine Gebühr. Er ist Ihre erste Demonstration von Ernsthaftigkeit, Respekt und einem Verständnis für Ihren Platz.", "Le tribut administratif n'est pas des frais. C'est votre première démonstration de sérieux, de respect et de compréhension de votre place."],
  "A serious submissive does not offer the least he can. The higher and more respectful the tribute you offer, the more seriously your application will be considered, and the faster it may be reviewed. Weak offerings are not prioritised.": ["Ein ernsthafter Submissiver bietet nicht das Wenigste an, was er kann. Je höher und respektvoller der Tribut, den Sie anbieten, desto ernsthafter wird Ihre Bewerbung geprüft und desto schneller kann sie bearbeitet werden. Schwache Gaben werden nicht bevorzugt behandelt.", "Un soumis sérieux n'offre pas le strict minimum. Plus le tribut que vous offrez est élevé et respectueux, plus votre candidature sera prise au sérieux, et plus vite elle pourra être examinée. Les offrandes modestes ne sont pas traitées en priorité."],
  "A strong offering shows a true understanding of your place and a genuine desire to serve. Choose an amount that proves it.": ["Eine starke Gabe zeigt wahres Verständnis für Ihren Platz und den aufrichtigen Wunsch zu dienen. Wählen Sie einen Betrag, der es beweist.", "Une offrande généreuse témoigne d'une véritable compréhension de votre place et d'un désir sincère de servir. Choisissez un montant qui le prouve."],
  "Suggested offerings": ["Vorgeschlagene Gaben", "Offrandes suggérées"],
  "Nothing is paid through this site. Your offer is a pledge only. If you are found suitable, payment is arranged privately after acceptance.": ["Über diese Website wird nichts bezahlt. Ihr Angebot ist nur eine Zusage. Wenn Sie als geeignet befunden werden, wird die Zahlung nach der Annahme privat vereinbart.", "Rien n'est payé via ce site. Votre offre n'est qu'un engagement. Si vous êtes jugé apte, le paiement est convenu en privé après acceptation."],
  "Service to Me is a privilege, not a transaction. I accept very few into long-term training.": ["Mir zu dienen ist ein Privileg, keine Transaktion. Ich nehme nur sehr wenige in die langfristige Erziehung auf.", "Me servir est un privilège, non une transaction. J'accepte très peu de personnes en dressage à long terme."],
  "I expect devotion, discipline, and absolute honesty. Every answer you give will be read by Me personally — falsehood ends your consideration immediately.": ["Ich erwarte Hingabe, Disziplin und absolute Ehrlichkeit. Jede Ihrer Antworten wird von Mir persönlich gelesen – Unwahrheit beendet Ihre Prüfung sofort.", "J'exige dévotion, discipline et honnêteté absolue. Chaque réponse sera lue personnellement par Moi — le mensonge met immédiatement fin à votre candidature."],
  "I am willing to offer 100% obedience to Mistress Sofia within negotiated limits.": ["Ich bin bereit, Mistress Sofia innerhalb der ausgehandelten Grenzen 100 % Gehorsam zu leisten.", "Je suis prêt à offrir une obéissance à 100 % à Mistress Sofia dans les limites négociées."],
  "Why do you seek to serve Mistress Sofia?": ["Warum möchten Sie Mistress Sofia dienen?", "Pourquoi souhaitez-vous servir Mistress Sofia ?"],
  "I formally acknowledge that all information provided is true, that I am over 18, and that submission does not guarantee acceptance.": ["Ich bestätige förmlich, dass alle Angaben wahr sind, dass ich über 18 Jahre alt bin und dass die Einsendung keine Annahme garantiert.", "Je reconnais formellement que toutes les informations fournies sont exactes, que j'ai plus de 18 ans et que l'envoi ne garantit pas l'acceptation."],
  "Your Application Has Been Received": ["Ihre Bewerbung ist eingegangen", "Votre candidature a bien été reçue"],
  "Keep this reference. This confirms receipt only — not acceptance. If you are found suitable, you will be contacted privately with next steps, including how your administrative tribute is arranged. Do not chase.": ["Bewahren Sie diese Referenz auf. Dies bestätigt nur den Eingang – keine Annahme. Wenn Sie als geeignet befunden werden, werden Sie privat mit den nächsten Schritten kontaktiert, einschließlich der Vereinbarung Ihres administrativen Tributs. Haken Sie nicht nach.", "Conservez cette référence. Ceci confirme uniquement la réception — pas l'acceptation. Si vous êtes jugé apte, vous serez contacté en privé pour les prochaines étapes, y compris les modalités de votre tribut administratif. Ne relancez pas."],
  // ---- Privacy page
  "Your Privacy": ["Ihre Privatsphäre", "Votre vie privée"],
  "What is collected": ["Was erfasst wird", "Ce qui est collecté"],
  "When you complete the application or booking form, the answers you type are stored: your name, contact details, age, and your answers about experience, preferences and tribute or session choices. The booking form also asks about health, limits and preferences. These sensitive details are requested only because they affect your safety and the planning of any session — share only what genuinely matters. Both forms ask for your explicit consent before anything is stored.": ["Wenn Sie das Bewerbungs- oder Buchungsformular ausfüllen, werden Ihre Eingaben gespeichert: Ihr Name, Ihre Kontaktdaten, Ihr Alter sowie Ihre Angaben zu Erfahrung, Vorlieben und zur Wahl von Tribut oder Session. Das Buchungsformular fragt außerdem nach Gesundheit, Grenzen und Vorlieben. Diese sensiblen Angaben werden nur erfragt, weil sie Ihre Sicherheit und die Planung jeder Session betreffen – teilen Sie nur, was wirklich wichtig ist. Beide Formulare verlangen Ihre ausdrückliche Einwilligung, bevor etwas gespeichert wird.", "Lorsque vous remplissez le formulaire de candidature ou de réservation, les réponses que vous saisissez sont conservées : votre nom, vos coordonnées, votre âge, ainsi que vos réponses sur l'expérience, les préférences et le choix du tribut ou de la séance. Le formulaire de réservation pose aussi des questions sur la santé, les limites et les préférences. Ces informations sensibles ne sont demandées que parce qu'elles touchent à votre sécurité et à la préparation de toute séance — ne partagez que ce qui compte vraiment. Les deux formulaires demandent votre consentement explicite avant que quoi que ce soit ne soit conservé."],
  "Who reads it": ["Wer es liest", "Qui le lit"],
  "Your submission goes to a private inbox that only Mistress Sofia can access. It is never published, sold, or shared with anyone else.": ["Ihre Einsendung geht an ein privates Postfach, auf das nur Mistress Sofia Zugriff hat. Sie wird nie veröffentlicht, verkauft oder an Dritte weitergegeben.", "Votre envoi arrive dans une boîte privée accessible uniquement à Mistress Sofia. Il n'est jamais publié, vendu ni partagé avec qui que ce soit."],
  "How long it is kept": ["Wie lange es aufbewahrt wird", "Durée de conservation"],
  "Declined requests are deleted within 24 hours of the decision.": ["Abgelehnte Anfragen werden innerhalb von 24 Stunden nach der Entscheidung gelöscht.", "Les demandes refusées sont supprimées dans les 24 heures suivant la décision."],
  "Undecided requests are deleted automatically after 90 days.": ["Unentschiedene Anfragen werden nach 90 Tagen automatisch gelöscht.", "Les demandes en attente sont supprimées automatiquement après 90 jours."],
  "Accepted requests are kept until Mistress Sofia deletes them or you ask for deletion.": ["Angenommene Anfragen werden aufbewahrt, bis Mistress Sofia sie löscht oder Sie die Löschung verlangen.", "Les demandes acceptées sont conservées jusqu'à ce que Mistress Sofia les supprime ou que vous en demandiez la suppression."],
  "How to request deletion": ["So beantragen Sie die Löschung", "Comment demander la suppression"],
  "Email {email} with the reference ID shown on your confirmation screen, and your submission will be deleted. You may do this at any time, whatever the status of your request.": ["Senden Sie eine E-Mail an {email} mit der Referenznummer, die auf Ihrer Bestätigungsseite angezeigt wird, und Ihre Einsendung wird gelöscht. Das ist jederzeit möglich, unabhängig vom Status Ihrer Anfrage.", "Écrivez à {email} en indiquant le numéro de référence affiché sur votre écran de confirmation, et votre envoi sera supprimé. Vous pouvez le faire à tout moment, quel que soit l'état de votre demande."],
  "Who stores it": ["Wer es speichert", "Qui le conserve"],
  "Submissions are held in a private, access-controlled database that only the owner's verified account can read, and the owner is alerted by an email that contains only your reference ID, never your answers. The site does not use advertising or tracking cookies, and does not sell or share your information.": ["Einsendungen werden in einer privaten, zugriffsgeschützten Datenbank gespeichert, die nur das verifizierte Konto der Inhaberin lesen kann. Die Inhaberin wird per E-Mail benachrichtigt, die nur Ihre Referenznummer enthält, niemals Ihre Antworten. Die Website verwendet keine Werbe- oder Tracking-Cookies und verkauft oder teilt Ihre Daten nicht.", "Les envois sont conservés dans une base de données privée à accès contrôlé, que seul le compte vérifié de la propriétaire peut lire ; la propriétaire est alertée par un e-mail qui ne contient que votre numéro de référence, jamais vos réponses. Le site n'utilise pas de cookies publicitaires ou de suivi, et ne vend ni ne partage vos informations."],
  "What this site stores in your browser": ["Was diese Website in Ihrem Browser speichert", "Ce que ce site enregistre dans votre navigateur"],
  "Your confirmation that you are an adult (for 30 days), and your language and currency choice, are remembered in your browser so you are not asked on every visit. While you complete a form, your progress is kept only in that browser tab and is cleared when you submit or close the tab. Nothing else is stored.": ["Ihre Bestätigung, dass Sie erwachsen sind (30 Tage), sowie Ihre Sprach- und Währungswahl werden in Ihrem Browser gespeichert, damit Sie nicht bei jedem Besuch gefragt werden. Während Sie ein Formular ausfüllen, wird Ihr Fortschritt nur in diesem Browser-Tab gehalten und beim Absenden oder Schließen des Tabs gelöscht. Sonst wird nichts gespeichert.", "Votre confirmation de majorité (pendant 30 jours), ainsi que votre choix de langue et de devise, sont mémorisés dans votre navigateur afin de ne pas vous les redemander à chaque visite. Pendant que vous remplissez un formulaire, votre progression n'est conservée que dans cet onglet et est effacée lorsque vous envoyez ou fermez l'onglet. Rien d'autre n'est enregistré."],
  "Your rights": ["Ihre Rechte", "Vos droits"],
  "You may ask to see, correct or delete what you have submitted at any time, by emailing {email} with your reference ID.": ["Sie können jederzeit verlangen, einzusehen, zu berichtigen oder zu löschen, was Sie eingereicht haben, indem Sie eine E-Mail mit Ihrer Referenznummer an {email} senden.", "Vous pouvez à tout moment demander à consulter, corriger ou supprimer ce que vous avez envoyé, en écrivant à {email} avec votre numéro de référence."],
  "Adults only": ["Nur für Erwachsene", "Réservé aux adultes"],
  "This site is strictly for adults aged 18 or over (or of legal age in your jurisdiction). No information is knowingly collected from anyone under 18.": ["Diese Website ist ausschließlich für Erwachsene ab 18 Jahren (oder im Rechtsgebiet Volljährige) bestimmt. Es werden wissentlich keine Informationen von Personen unter 18 Jahren erfasst.", "Ce site est strictement réservé aux adultes de 18 ans ou plus (ou ayant l'âge légal dans leur pays). Aucune information n'est sciemment collectée auprès de personnes de moins de 18 ans."],
  // ---- Gallery
  "Gallery": ["Galerie", "Galerie"],
  "A Glimpse of the Experience": ["Ein Einblick in das Erlebnis", "Un aperçu de l'expérience"],
  "Loading…": ["Wird geladen…", "Chargement…"],
  "The gallery could not be loaded. Please try again later.": ["Die Galerie konnte nicht geladen werden. Bitte versuchen Sie es später erneut.", "La galerie n'a pas pu être chargée. Veuillez réessayer plus tard."],
  "New photos are coming soon.": ["Neue Fotos folgen in Kürze.", "De nouvelles photos arrivent bientôt."],
  "Gallery photo {n} of {total}": ["Galeriefoto {n} von {total}", "Photo de la galerie {n} sur {total}"],
  "Photo viewer": ["Fotobetrachter", "Visionneuse de photos"],
  "Previous photo": ["Vorheriges Foto", "Photo précédente"],
  "Next photo": ["Nächstes Foto", "Photo suivante"],
  // ---- Not found
  "Error 404": ["Fehler 404", "Erreur 404"],
  "Page not found": ["Seite nicht gefunden", "Page introuvable"],
  "The page you are looking for does not exist or has been moved.": ["Die gesuchte Seite existiert nicht oder wurde verschoben.", "La page que vous recherchez n'existe pas ou a été déplacée."],
  "Go home": ["Zur Startseite", "Retour à l'accueil"],
};

type Ctx = {
  lang: Lang;
  currency: Currency;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  t: (text: string, vars?: Vars) => string;
  money: (amount: number) => string;
  symbol: string;
};

function makeT(lang: Lang) {
  return (text: string, vars?: Vars) => {
    const hit = lang === "en" ? undefined : D[text]?.[lang === "de" ? 0 : 1];
    const out = hit ?? text;
    return vars ? out.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : out;
  };
}
function makeMoney(lang: Lang, currency: Currency) {
  return (amount: number) => (currency === "EUR" && lang !== "en" ? `${amount} €` : `${CURRENCY_SYMBOL[currency]}${amount}`);
}

const fallback: Ctx = { lang: "en", currency: "GBP", setLang: () => {}, setCurrency: () => {}, t: makeT("en"), money: makeMoney("en", "GBP"), symbol: "£" };
const I18nContext = createContext<Ctx>(fallback);
export const useI18n = () => useContext(I18nContext);

// First visit: pick the language and currency from the browser's own settings. Nothing is stored
// until the visitor actually chooses something in the switcher.
function detect(): Prefs {
  let lang: Lang = "en";
  let region = "";
  try {
    const first = (navigator.languages?.[0] ?? navigator.language ?? "en").split("-");
    const base = (first[0] ?? "en").toLowerCase();
    if (base === "de" || base === "fr") lang = base;
    region = (first[1] ?? "").toUpperCase();
  } catch { /* keep defaults */ }
  const currency: Currency = region === "US" ? "USD" : EURO_REGIONS.has(region) ? "EUR" : "GBP";
  return { lang, currency };
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  // Always starts as English / GBP so the server page and the first browser render match.
  const [prefs, setPrefs] = useState<Prefs>({ lang: "en", currency: "GBP" });

  useEffect(() => {
    let saved: Prefs | null = null;
    try {
      const v = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null") as Partial<Prefs> | null;
      if (v && LANGS.includes(v.lang as Lang) && CURRENCIES.includes(v.currency as Currency)) saved = v as Prefs;
    } catch { /* ignore */ }
    setPrefs(saved ?? detect());
  }, []);

  useEffect(() => { document.documentElement.lang = prefs.lang; }, [prefs.lang]);

  const save = useCallback((next: Prefs) => {
    setPrefs(next);
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* storage blocked */ }
  }, []);

  const value = useMemo<Ctx>(() => ({
    lang: prefs.lang,
    currency: prefs.currency,
    setLang: (lang) => save({ ...prefs, lang }),
    setCurrency: (currency) => save({ ...prefs, currency }),
    t: makeT(prefs.lang),
    money: makeMoney(prefs.lang, prefs.currency),
    symbol: CURRENCY_SYMBOL[prefs.currency],
  }), [prefs, save]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const selectClass = "border border-input bg-background px-2 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:border-gold-soft focus:border-gold";

export function PrefsSwitcher({ className = "" }: { className?: string }) {
  const { lang, currency, setLang, setCurrency, t } = useI18n();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select aria-label={t("Language")} className={selectClass} value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
      </select>
      <select aria-label={t("Currency")} className={selectClass} value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
        {CURRENCIES.map((c) => <option key={c} value={c}>{CURRENCY_SYMBOL[c]} {c}</option>)}
      </select>
    </div>
  );
}
