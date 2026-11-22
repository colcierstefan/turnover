import type {
  ApplianceCategory,
  DocumentKind,
} from "@turnover/core/appliance/constants/appliance.constants";
import type { HandymanTrade } from "@turnover/core/handyman/constants/handyman.constants";
import type {
  EmergencyType,
  IssueCategory,
  IssueStatus,
  ReporterRole,
  WarrantyStatus,
} from "@turnover/core/issue/constants/issue.constants";
import type { UserErrorReason } from "@turnover/core/lib/errors";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

type ApplianceTextField =
  | "brand"
  | "model"
  | "serialNumber"
  | "manufactureDate"
  | "purchaseDate"
  | "purchasePriceRon"
  | "warrantyUntil"
  | "notes";

type FormErrorField =
  | ApplianceTextField
  | "name"
  | "address"
  | "contactPhone"
  | "phone"
  | "trades"
  | "email"
  | "description"
  | "photos"
  | "category"
  | "file"
  | "count"
  | "rows";

type UnitContents = {
  applianceCount: number;
  documentCount: number;
  issueCount: number;
};

type ManagerText = {
  locale: string;
  formErrors: Record<FormErrorField, string>;
  formInvalid: string;
  userErrors: Record<UserErrorReason, string>;
  header: {
    units: string;
    issues: string;
    team: string;
    handymen: string;
    settings: string;
    logOut: string;
  };
  copyLink: string;
  copied: string;
  save: string;
  backToUnit: string;
  chooseLanguage: string;
  settings: { title: string; language: string };
  home: {
    signedInAs: (name: string) => string;
    createOrganizationTitle: string;
    createOrganizationIntro: string;
    organizationNameLabel: string;
    organizationNamePlaceholder: string;
    contactPhoneLabel: string;
    createOrganization: string;
    logOut: string;
  };
  invitation: {
    invalid: string;
    used: string;
    expired: string;
    invitedBefore: string;
    invitedAfter: string;
    inviteFor: (invitedEmail: string, signedInEmail: string) => string;
    accept: string;
    logOutForOtherAccount: string;
  };
  units: {
    addUnitTitle: string;
    empty: string;
    nameLabel: string;
    namePlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    addUnit: string;
  };
  unit: {
    allUnits: string;
    openIssuesTitle: string;
    reportIssue: string;
    appliancesTitle: string;
    addAppliance: string;
    waitingForReviewTitle: string;
    detailsTitle: string;
    deleteUnit: string;
    deleteConfirm: (unitName: string, contents: UnitContents) => string;
  };
  reportLink: {
    title: string;
    intro: string;
    qrAlt: (unitName: string) => string;
    qrFileName: (unitName: string) => string;
    downloadQr: string;
    newLink: string;
    newLinkConfirm: string;
  };
  issues: {
    title: string;
    empty: string;
    emergency: (type: string) => string;
    reporterRoles: Record<ReporterRole, string>;
    emergencyTypes: Record<EmergencyType, string>;
    statuses: Record<IssueStatus, string>;
  };
  issue: {
    title: string;
    photosTitle: string;
    photoAlt: (index: number) => string;
    followUpsTitle: string;
    noAnswer: string;
    tipsTitle: string;
    fixedByReporter: string;
    diagnosisTitle: string;
    notDiagnosed: string;
    diagnose: string;
    diagnoseAgain: string;
    diagnosing: string;
    diagnoseFailed: string;
    applianceLabel: string;
    noAppliance: string;
    warranty: Record<WarrantyStatus, (date: string) => string>;
    categories: Record<IssueCategory, string>;
    likelyCauseTitle: string;
    nextStepsTitle: string;
    tradeLabel: string;
    trades: Record<HandymanTrade, string>;
    estimateTitle: string;
    estimateIntro: string;
    partCost: string;
    labourCost: string;
    newApplianceCost: string;
    costRange: (minRon: string, maxRon: string) => string;
  };
  handymen: {
    title: string;
    intro: string;
    empty: string;
    addTitle: string;
    nameLabel: string;
    phoneLabel: string;
    phonePlaceholder: string;
    tradesLabel: string;
    notesLabel: string;
    addHandyman: string;
    allHandymen: string;
    detailsTitle: string;
    saved: string;
    deleteHandyman: string;
    deleteConfirm: (name: string) => string;
  };
  handymanContact: {
    title: string;
    warrantyHint: string;
    yourHandymenTitle: string;
    noHandymen: string;
    matchesTrade: string;
    someoneElseTitle: string;
    phoneLabel: string;
    nameLabel: string;
    writeMessage: string;
    chooseChatInWhatsApp: string;
    drafting: string;
    draftFailed: string;
    messageTo: (recipient: string) => string;
    messageToChosenChat: string;
    messageRoLabel: string;
    messageEnLabel: string;
    romanianPreviewLabel: string;
    updateRomanian: string;
    updatingRomanian: string;
    romanianOutdated: string;
    openInWhatsApp: string;
    sharePhotos: string;
    changeRecipient: string;
    saveAsHandymanTitle: string;
    saveAsHandyman: string;
    notNow: string;
    savedAsHandyman: string;
    historyTitle: string;
    chosenInWhatsApp: string;
    openedOn: (date: string) => string;
  };
  newIssue: {
    title: string;
    intro: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    photosLabel: string;
    applianceLabel: string;
    noAppliance: string;
    submit: string;
    submitting: string;
  };
  appliance: {
    categories: Record<ApplianceCategory, string>;
    categoryLabel: string;
    chooseCategory: string;
    fieldLabels: Record<ApplianceTextField, string>;
    fieldPlaceholders: Partial<Record<ApplianceTextField, string>>;
    empty: string;
    noBrandOrModel: string;
    addAppliance: string;
    detailsTitle: string;
    documentsTitle: string;
    documentKinds: Record<DocumentKind, string>;
    uploaded: (kind: string, date: string) => string;
    deleteAppliance: string;
    deleteConfirm: string;
  };
  newAppliance: {
    title: string;
    labelPhotoTitle: string;
    labelPhotoIntro: string;
    readLabel: string;
    readingLabel: string;
    invoiceTitle: string;
    invoiceIntro: string;
    readInvoice: string;
    readingInvoice: string;
    manualTitle: string;
    fileTooLarge: string;
  };
  documentReview: {
    titleInvoice: string;
    titleLabel: string;
    uploadedFileAlt: string;
    openFile: string;
    alreadyReviewed: string;
    checkFields: string;
    couldNotRead: string;
    addThisAppliance: string;
    howManyToAdd: (quantity: number) => string;
    review: string;
    uploadedOn: (date: string) => string;
    discard: string;
    discardConfirm: string;
  };
  team: {
    title: string;
    membersTitle: string;
    owner: string;
    manager: string;
    remove: string;
    emergencyContactTitle: string;
    emergencyContactIntro: string;
    contactPhoneLabel: string;
    saved: string;
    savePhone: string;
    inviteTitle: string;
    managerEmailLabel: string;
    createInvite: string;
    sendLink: (email: string) => string;
    shareOnWhatsApp: string;
    whatsAppMessage: (
      organizationName: string,
      invitationUrl: string,
    ) => string;
    pendingTitle: string;
    noPending: string;
    expires: (date: string) => string;
  };
};

export const MANAGER_TEXT: Record<UserLanguage, ManagerText> = {
  EN: {
    locale: "en-GB",
    formErrors: {
      name: "Enter a name of up to 100 characters.",
      address: "Enter an address of up to 300 characters.",
      contactPhone: "Enter a phone number, e.g. +40 712 345 678.",
      phone: "Enter a valid phone number, e.g. 0712 345 678.",
      trades: "Choose at least one trade.",
      email: "Enter a valid email.",
      description: "Describe the problem in up to 2000 characters.",
      photos: "Add up to 3 photos, each under 10 MB.",
      category: "Choose a category.",
      brand: "Keep the brand under 100 characters.",
      model: "Keep the model under 100 characters.",
      serialNumber: "Keep the serial number under 100 characters.",
      manufactureDate: "Use YYYY, YYYY-MM or YYYY-MM-DD.",
      purchaseDate: "Enter a valid purchase date.",
      purchasePriceRon: "Enter a valid price.",
      warrantyUntil: "Enter a valid warranty date.",
      notes: "Keep the notes under 1000 characters.",
      file: "Choose a supported file of up to 10 MB.",
      count: "Add between 1 and 20.",
      rows: "Choose at least one appliance, or discard the upload.",
    },
    formInvalid: "Something went wrong. Reload the page and try again.",
    userErrors: {
      ALREADY_IN_ORGANIZATION: "You already belong to an organization.",
      ALREADY_IN_TEAM: "This person is already in your team.",
      INVITATION_NOT_FOUND: "This invite link is not valid.",
      INVITATION_USED: "This invite link was already used.",
      INVITATION_EXPIRED: "This invite link has expired. Ask for a new one.",
      EMAIL_NOT_VERIFIED: "Verify your email address first.",
      INVITATION_EMAIL_MISMATCH:
        "This invite is for a different email address than the one you are signed in with.",
      DOCUMENT_ALREADY_REVIEWED: "This upload was already reviewed.",
      HANDYMAN_PHONE_TAKEN:
        "A handyman with this phone number is already saved.",
    },
    header: {
      units: "Units",
      issues: "Issues",
      team: "Team",
      handymen: "Handymen",
      settings: "Settings",
      logOut: "Log out",
    },
    copyLink: "Copy link",
    copied: "Copied",
    save: "Save",
    backToUnit: "← Back to unit",
    chooseLanguage: "Choose your language",
    settings: { title: "Settings", language: "Language" },
    home: {
      signedInAs: (name) => `Signed in as ${name}`,
      createOrganizationTitle: "Create your organization",
      createOrganizationIntro:
        "Your units and team live in one organization. To join an existing one, open the invite link you received.",
      organizationNameLabel: "Organization name",
      organizationNamePlaceholder: "e.g. Cluj Stays",
      contactPhoneLabel: "Contact phone (shown to guests in an emergency)",
      createOrganization: "Create organization",
      logOut: "Log out",
    },
    invitation: {
      invalid: "This invite link is not valid.",
      used: "This invite link was already used.",
      expired: "This invite link has expired. Ask for a new one.",
      invitedBefore: "You are invited to join",
      invitedAfter: "as a manager.",
      inviteFor: (invitedEmail, signedInEmail) =>
        `Invite for ${invitedEmail}, you are signed in as ${signedInEmail}.`,
      accept: "Accept invitation",
      logOutForOtherAccount: "Log out to use a different account",
    },
    units: {
      addUnitTitle: "Add a unit",
      empty: "No units yet. Add your first one below.",
      nameLabel: "Name",
      namePlaceholder: "e.g. Old Town studio",
      addressLabel: "Address",
      addressPlaceholder: "Street, number, apartment, city",
      addUnit: "Add unit",
    },
    unit: {
      allUnits: "← All units",
      openIssuesTitle: "Open issues",
      reportIssue: "Report an issue",
      appliancesTitle: "Appliances",
      addAppliance: "Add appliance",
      waitingForReviewTitle: "Waiting for review",
      detailsTitle: "Details",
      deleteUnit: "Delete unit",
      deleteConfirm: (unitName, contents) => {
        const { applianceCount, documentCount, issueCount } = contents;
        const deletedContents =
          applianceCount + documentCount + issueCount > 0
            ? ` This also deletes ${countEnglish(applianceCount, "appliance")}, ${countEnglish(documentCount, "document")} and ${countEnglish(issueCount, "issue")}.`
            : "";
        return `Delete ${unitName}?${deletedContents} This cannot be undone.`;
      },
    },
    reportLink: {
      title: "Report link",
      intro:
        "Guests and cleaners open this link (or scan the QR code) to report a problem. No login needed.",
      qrAlt: (unitName) => `QR code for ${unitName}`,
      qrFileName: (unitName) => `${unitName} QR code.svg`,
      downloadQr: "Download QR",
      newLink: "New link",
      newLinkConfirm:
        "The current link and QR code will stop working at once. Continue?",
    },
    issues: {
      title: "Open issues",
      empty: "No open issues.",
      emergency: (type) => `Emergency: ${type}`,
      reporterRoles: { GUEST: "Guest", CLEANER: "Cleaner", MANAGER: "Manager" },
      emergencyTypes: {
        GAS_SMELL: "Gas smell",
        WATER_LEAK: "Water leak",
        ELECTRICAL_BURNING: "Electrical burning",
      },
      statuses: {
        NEW: "New",
        DIAGNOSED: "Diagnosed",
        CONTACTED: "Handyman contacted",
        SCHEDULED: "Scheduled",
        RESOLVED: "Resolved",
      },
    },
    issue: {
      title: "Issue",
      photosTitle: "Photos",
      photoAlt: (index) => `Photo ${index}`,
      followUpsTitle: "Follow-up questions",
      noAnswer: "No answer",
      tipsTitle: "Tips shown to the reporter",
      fixedByReporter: "The reporter said the tips fixed it.",
      diagnosisTitle: "Diagnosis",
      notDiagnosed: "Not diagnosed yet.",
      diagnose: "Diagnose",
      diagnoseAgain: "Diagnose again",
      diagnosing: "Diagnosing…",
      diagnoseFailed: "The diagnosis failed. Try again.",
      applianceLabel: "Appliance",
      noAppliance: "None of the appliances",
      warranty: {
        UNDER_WARRANTY: (date) => `Under warranty until ${date}`,
        EXPIRED: (date) => `Warranty ended ${date}`,
        UNKNOWN: () => "Warranty unknown",
      },
      categories: {
        SELF_FIX: "Fix without a handyman",
        PART: "Replace a part",
        REPAIR: "Repair",
        REPLACE: "Replace the appliance",
      },
      likelyCauseTitle: "Likely cause",
      nextStepsTitle: "Next steps",
      tradeLabel: "Who to call",
      trades: {
        PLUMBER: "Plumber",
        ELECTRICIAN: "Electrician",
        APPLIANCE_TECHNICIAN: "Appliance technician",
        AC_TECHNICIAN: "AC technician",
        LOCKSMITH: "Locksmith",
        GENERAL_HANDYMAN: "General handyman",
      },
      estimateTitle: "Estimate, not a quote",
      estimateIntro:
        "Typical Romanian prices estimated by AI. Ask your handyman for a quote.",
      partCost: "Part",
      labourCost: "Labour",
      newApplianceCost: "Comparable new appliance",
      costRange: (minRon, maxRon) => `${minRon} to ${maxRon} RON`,
    },
    handymen: {
      title: "Handymen",
      intro:
        "Your own contacts. The issue view offers them when an issue needs their trade.",
      empty: "No handymen yet.",
      addTitle: "Add a handyman",
      nameLabel: "Name",
      phoneLabel: "Phone",
      phonePlaceholder: "e.g. 0712 345 678",
      tradesLabel: "Trades",
      notesLabel: "Notes (optional)",
      addHandyman: "Add handyman",
      allHandymen: "← All handymen",
      detailsTitle: "Details",
      saved: "Saved.",
      deleteHandyman: "Delete handyman",
      deleteConfirm: (name) =>
        `Delete ${name}? Messages already sent stay in the issues' history.`,
    },
    handymanContact: {
      title: "Contact a handyman",
      warrantyHint:
        "This appliance is under warranty. Contact the shop or the brand's service first.",
      yourHandymenTitle: "Your handymen",
      noHandymen: "No saved handymen yet.",
      matchesTrade: "matches",
      someoneElseTitle: "Someone else",
      phoneLabel: "Phone",
      nameLabel: "Name (optional)",
      writeMessage: "Write message",
      chooseChatInWhatsApp: "Choose the chat in WhatsApp",
      drafting: "Writing the message…",
      draftFailed: "Could not write the message. Try again.",
      messageTo: (recipient) => `Message to ${recipient}`,
      messageToChosenChat: "Message for a chat you choose in WhatsApp",
      messageRoLabel: "Message (Romanian)",
      messageEnLabel: "Message (English, edit here)",
      romanianPreviewLabel: "Romanian text that will be sent",
      updateRomanian: "Update Romanian text",
      updatingRomanian: "Updating…",
      romanianOutdated:
        "You changed the English. Update the Romanian text before sending.",
      openInWhatsApp: "Open in WhatsApp",
      sharePhotos: "Share photos",
      changeRecipient: "Choose someone else",
      saveAsHandymanTitle: "Save as a handyman for next time?",
      saveAsHandyman: "Save handyman",
      notNow: "Not now",
      savedAsHandyman: "Saved to your handymen.",
      historyTitle: "Messages sent",
      chosenInWhatsApp: "Chat chosen in WhatsApp",
      openedOn: (date) => `Opened in WhatsApp ${date}`,
    },
    newIssue: {
      title: "Report an issue",
      intro: "The issue is diagnosed as soon as you send it.",
      descriptionLabel: "What is wrong?",
      descriptionPlaceholder: "e.g. The washing machine does not drain",
      photosLabel: "Photos (up to 3)",
      applianceLabel: "Appliance (optional)",
      noAppliance: "Not sure, or none of these",
      submit: "Report and diagnose",
      submitting: "Diagnosing…",
    },
    appliance: {
      categories: {
        FRIDGE: "Fridge",
        FREEZER: "Freezer",
        OVEN: "Oven",
        HOB: "Hob",
        MICROWAVE: "Microwave",
        DISHWASHER: "Dishwasher",
        WASHING_MACHINE: "Washing machine",
        DRYER: "Dryer",
        WASHER_DRYER: "Washer-dryer",
        AIR_CONDITIONER: "Air conditioner",
        WATER_HEATER: "Water heater",
        EXTRACTOR_HOOD: "Extractor hood",
        TV: "TV",
        COFFEE_MACHINE: "Coffee machine",
        OTHER: "Other",
      },
      categoryLabel: "Category",
      chooseCategory: "Choose a category",
      fieldLabels: {
        brand: "Brand",
        model: "Model",
        serialNumber: "Serial number",
        manufactureDate: "Manufacture date",
        purchaseDate: "Purchase date",
        purchasePriceRon: "Purchase price (RON)",
        warrantyUntil: "Warranty until",
        notes: "Notes",
      },
      fieldPlaceholders: {
        brand: "e.g. Bosch",
        model: "e.g. WAN28262BY",
        manufactureDate: "YYYY, YYYY-MM or YYYY-MM-DD",
      },
      empty: "No appliances yet.",
      noBrandOrModel: "No brand or model",
      addAppliance: "Add appliance",
      detailsTitle: "Details",
      documentsTitle: "Documents",
      documentKinds: {
        LABEL_PHOTO: "Label photo",
        INVOICE: "Invoice",
        PHOTO: "Photo",
      },
      uploaded: (kind, date) => `${kind}, uploaded ${date}`,
      deleteAppliance: "Delete appliance",
      deleteConfirm:
        "Delete this appliance? Its label photo and invoice are deleted too unless another appliance uses them.",
    },
    newAppliance: {
      title: "Add appliance",
      labelPhotoTitle: "Photo of the label",
      labelPhotoIntro:
        "The rating plate, usually inside the door or on the back.",
      readLabel: "Read label",
      readingLabel: "Reading the label…",
      invoiceTitle: "Invoice",
      invoiceIntro:
        "Photo or PDF. Every appliance on it becomes a row to review.",
      readInvoice: "Read invoice",
      readingInvoice: "Reading the invoice…",
      manualTitle: "Enter by hand",
      fileTooLarge: "The file is over 10 MB.",
    },
    documentReview: {
      titleInvoice: "Review invoice",
      titleLabel: "Review label",
      uploadedFileAlt: "Uploaded file",
      openFile: "Open the uploaded file",
      alreadyReviewed: "This upload was already reviewed.",
      checkFields: "Check every field. Highlighted fields could not be read.",
      couldNotRead: "We could not read this file. Fill in the fields yourself.",
      addThisAppliance: "Add this appliance",
      howManyToAdd: (quantity) =>
        `${quantity} on this invoice. How many to add?`,
      review: "Review",
      uploadedOn: (date) => `Uploaded ${date}`,
      discard: "Discard",
      discardConfirm: "Discard this upload? The file is deleted.",
    },
    team: {
      title: "Team",
      membersTitle: "Members",
      owner: "Owner",
      manager: "Manager",
      remove: "Remove",
      emergencyContactTitle: "Emergency contact",
      emergencyContactIntro:
        "Guests and cleaners see this number when they report an emergency.",
      contactPhoneLabel: "Contact phone",
      saved: "Saved.",
      savePhone: "Save phone",
      inviteTitle: "Invite a manager",
      managerEmailLabel: "Manager email",
      createInvite: "Create invite link",
      sendLink: (email) =>
        `Send this link to ${email}. It works for 7 days and only for that email.`,
      shareOnWhatsApp: "Share on WhatsApp",
      whatsAppMessage: (organizationName, invitationUrl) =>
        `Join ${organizationName} on Turnover: ${invitationUrl}`,
      pendingTitle: "Pending invites",
      noPending: "No pending invites.",
      expires: (date) => `Expires ${date}`,
    },
  },
  RO: {
    locale: "ro-RO",
    formErrors: {
      name: "Introdu un nume de cel mult 100 de caractere.",
      address: "Introdu o adresă de cel mult 300 de caractere.",
      contactPhone: "Introdu un număr de telefon, de ex. +40 712 345 678.",
      phone: "Introdu un număr de telefon valid, de ex. 0712 345 678.",
      trades: "Alege cel puțin o meserie.",
      email: "Introdu o adresă de email validă.",
      description: "Descrie problema în cel mult 2000 de caractere.",
      photos: "Adaugă cel mult 3 fotografii, fiecare sub 10 MB.",
      category: "Alege o categorie.",
      brand: "Marca poate avea cel mult 100 de caractere.",
      model: "Modelul poate avea cel mult 100 de caractere.",
      serialNumber: "Numărul de serie poate avea cel mult 100 de caractere.",
      manufactureDate: "Folosește AAAA, AAAA-LL sau AAAA-LL-ZZ.",
      purchaseDate: "Introdu o dată de cumpărare validă.",
      purchasePriceRon: "Introdu un preț valid.",
      warrantyUntil: "Introdu o dată validă pentru garanție.",
      notes: "Notițele pot avea cel mult 1000 de caractere.",
      file: "Alege un fișier acceptat, de cel mult 10 MB.",
      count: "Adaugă între 1 și 20.",
      rows: "Alege cel puțin un aparat sau renunță la fișier.",
    },
    formInvalid: "A apărut o eroare. Reîncarcă pagina și încearcă din nou.",
    userErrors: {
      ALREADY_IN_ORGANIZATION: "Faci deja parte dintr-o organizație.",
      ALREADY_IN_TEAM: "Această persoană face deja parte din echipă.",
      INVITATION_NOT_FOUND: "Acest link de invitație nu este valid.",
      INVITATION_USED: "Acest link de invitație a fost deja folosit.",
      INVITATION_EXPIRED: "Acest link de invitație a expirat. Cere unul nou.",
      EMAIL_NOT_VERIFIED: "Confirmă mai întâi adresa de email.",
      INVITATION_EMAIL_MISMATCH:
        "Invitația este pentru altă adresă de email decât cea cu care ești conectat.",
      DOCUMENT_ALREADY_REVIEWED: "Acest fișier a fost deja verificat.",
      HANDYMAN_PHONE_TAKEN:
        "Un meșter cu acest număr de telefon este deja salvat.",
    },
    header: {
      units: "Unități",
      issues: "Probleme",
      team: "Echipă",
      handymen: "Meșteri",
      settings: "Setări",
      logOut: "Deconectare",
    },
    copyLink: "Copiază linkul",
    copied: "Copiat",
    save: "Salvează",
    backToUnit: "← Înapoi la unitate",
    chooseLanguage: "Alege limba",
    settings: { title: "Setări", language: "Limba" },
    home: {
      signedInAs: (name) => `Conectat ca ${name}`,
      createOrganizationTitle: "Creează organizația",
      createOrganizationIntro:
        "Unitățile și echipa ta sunt într-o singură organizație. Ca să te alături uneia existente, deschide linkul de invitație primit.",
      organizationNameLabel: "Numele organizației",
      organizationNamePlaceholder: "ex. Cazări Cluj",
      contactPhoneLabel:
        "Telefon de contact (afișat oaspeților în caz de urgență)",
      createOrganization: "Creează organizația",
      logOut: "Deconectare",
    },
    invitation: {
      invalid: "Acest link de invitație nu este valid.",
      used: "Acest link de invitație a fost deja folosit.",
      expired: "Acest link de invitație a expirat. Cere unul nou.",
      invitedBefore: "Ești invitat să te alături organizației",
      invitedAfter: "ca manager.",
      inviteFor: (invitedEmail, signedInEmail) =>
        `Invitație pentru ${invitedEmail}, ești conectat ca ${signedInEmail}.`,
      accept: "Acceptă invitația",
      logOutForOtherAccount: "Deconectează-te ca să folosești alt cont",
    },
    units: {
      addUnitTitle: "Adaugă o unitate",
      empty: "Nicio unitate încă. Adaug-o pe prima mai jos.",
      nameLabel: "Nume",
      namePlaceholder: "ex. Garsonieră în centrul vechi",
      addressLabel: "Adresă",
      addressPlaceholder: "Stradă, număr, apartament, oraș",
      addUnit: "Adaugă unitatea",
    },
    unit: {
      allUnits: "← Toate unitățile",
      openIssuesTitle: "Probleme deschise",
      reportIssue: "Raportează o problemă",
      appliancesTitle: "Aparate",
      addAppliance: "Adaugă un aparat",
      waitingForReviewTitle: "De verificat",
      detailsTitle: "Detalii",
      deleteUnit: "Șterge unitatea",
      deleteConfirm: (unitName, contents) => {
        const { applianceCount, documentCount, issueCount } = contents;
        const deletedContents =
          applianceCount + documentCount + issueCount > 0
            ? ` Se șterg și ${countRomanian(applianceCount, "un aparat", "aparate")}, ${countRomanian(documentCount, "un document", "documente")} și ${countRomanian(issueCount, "o problemă", "probleme")}.`
            : "";
        return `Ștergi ${unitName}?${deletedContents} Acțiunea nu poate fi anulată.`;
      },
    },
    reportLink: {
      title: "Link de raportare",
      intro:
        "Oaspeții și personalul de curățenie deschid acest link (sau scanează codul QR) ca să raporteze o problemă. Nu e nevoie de cont.",
      qrAlt: (unitName) => `Cod QR pentru ${unitName}`,
      qrFileName: (unitName) => `Cod QR ${unitName}.svg`,
      downloadQr: "Descarcă codul QR",
      newLink: "Link nou",
      newLinkConfirm:
        "Linkul și codul QR actuale nu vor mai funcționa imediat. Continui?",
    },
    issues: {
      title: "Probleme deschise",
      empty: "Nicio problemă deschisă.",
      emergency: (type) => `Urgență: ${type}`,
      reporterRoles: {
        GUEST: "Oaspete",
        CLEANER: "Personal de curățenie",
        MANAGER: "Manager",
      },
      emergencyTypes: {
        GAS_SMELL: "Miros de gaz",
        WATER_LEAK: "Scurgere de apă",
        ELECTRICAL_BURNING: "Miros de ars de la instalația electrică",
      },
      statuses: {
        NEW: "Nouă",
        DIAGNOSED: "Diagnosticată",
        CONTACTED: "Meșter contactat",
        SCHEDULED: "Programată",
        RESOLVED: "Rezolvată",
      },
    },
    issue: {
      title: "Problemă",
      photosTitle: "Fotografii",
      photoAlt: (index) => `Fotografia ${index}`,
      followUpsTitle: "Întrebări suplimentare",
      noAnswer: "Fără răspuns",
      tipsTitle: "Sfaturi afișate celui care a raportat",
      fixedByReporter:
        "Cel care a raportat a spus că sfaturile au rezolvat problema.",
      diagnosisTitle: "Diagnostic",
      notDiagnosed: "Nu a fost diagnosticată încă.",
      diagnose: "Diagnostichează",
      diagnoseAgain: "Diagnostichează din nou",
      diagnosing: "Se diagnostichează…",
      diagnoseFailed: "Diagnosticul a eșuat. Încearcă din nou.",
      applianceLabel: "Aparat",
      noAppliance: "Niciunul dintre aparate",
      warranty: {
        UNDER_WARRANTY: (date) => `În garanție până la ${date}`,
        EXPIRED: (date) => `Garanția a expirat pe ${date}`,
        UNKNOWN: () => "Garanție necunoscută",
      },
      categories: {
        SELF_FIX: "Se rezolvă fără meșter",
        PART: "Înlocuirea unei piese",
        REPAIR: "Reparație",
        REPLACE: "Înlocuirea aparatului",
      },
      likelyCauseTitle: "Cauza probabilă",
      nextStepsTitle: "Pașii următori",
      tradeLabel: "Pe cine chemi",
      trades: {
        PLUMBER: "Instalator",
        ELECTRICIAN: "Electrician",
        APPLIANCE_TECHNICIAN: "Tehnician electrocasnice",
        AC_TECHNICIAN: "Tehnician aer condiționat",
        LOCKSMITH: "Lăcătuș",
        GENERAL_HANDYMAN: "Meșter general",
      },
      estimateTitle: "Estimare, nu ofertă",
      estimateIntro:
        "Prețuri obișnuite în România, estimate de AI. Cere o ofertă de la meșterul tău.",
      partCost: "Piesă",
      labourCost: "Manoperă",
      newApplianceCost: "Aparat nou comparabil",
      costRange: (minRon, maxRon) => `între ${minRon} și ${maxRon} lei`,
    },
    handymen: {
      title: "Meșteri",
      intro:
        "Contactele tale. Pagina problemei ți le propune când e nevoie de meseria lor.",
      empty: "Niciun meșter încă.",
      addTitle: "Adaugă un meșter",
      nameLabel: "Nume",
      phoneLabel: "Telefon",
      phonePlaceholder: "ex. 0712 345 678",
      tradesLabel: "Meserii",
      notesLabel: "Notițe (opțional)",
      addHandyman: "Adaugă meșterul",
      allHandymen: "← Toți meșterii",
      detailsTitle: "Detalii",
      saved: "Salvat.",
      deleteHandyman: "Șterge meșterul",
      deleteConfirm: (name) =>
        `Ștergi pe ${name}? Mesajele deja trimise rămân în istoricul problemelor.`,
    },
    handymanContact: {
      title: "Contactează un meșter",
      warrantyHint:
        "Aparatul este în garanție. Contactează întâi magazinul sau service-ul mărcii.",
      yourHandymenTitle: "Meșterii tăi",
      noHandymen: "Niciun meșter salvat încă.",
      matchesTrade: "potrivit",
      someoneElseTitle: "Altcineva",
      phoneLabel: "Telefon",
      nameLabel: "Nume (opțional)",
      writeMessage: "Scrie mesajul",
      chooseChatInWhatsApp: "Alege conversația în WhatsApp",
      drafting: "Se scrie mesajul…",
      draftFailed: "Mesajul nu a putut fi scris. Încearcă din nou.",
      messageTo: (recipient) => `Mesaj către ${recipient}`,
      messageToChosenChat: "Mesaj pentru o conversație aleasă în WhatsApp",
      messageRoLabel: "Mesaj",
      messageEnLabel: "Mesaj (engleză)",
      romanianPreviewLabel: "Textul în română care se trimite",
      updateRomanian: "Actualizează textul în română",
      updatingRomanian: "Se actualizează…",
      romanianOutdated:
        "Ai modificat textul în engleză. Actualizează textul în română înainte de trimitere.",
      openInWhatsApp: "Deschide în WhatsApp",
      sharePhotos: "Trimite fotografiile",
      changeRecipient: "Alege pe altcineva",
      saveAsHandymanTitle: "Îl salvezi ca meșter pentru data viitoare?",
      saveAsHandyman: "Salvează meșterul",
      notNow: "Nu acum",
      savedAsHandyman: "Salvat la meșterii tăi.",
      historyTitle: "Mesaje trimise",
      chosenInWhatsApp: "Conversație aleasă în WhatsApp",
      openedOn: (date) => `Deschis în WhatsApp ${date}`,
    },
    newIssue: {
      title: "Raportează o problemă",
      intro: "Problema este diagnosticată imediat ce o trimiți.",
      descriptionLabel: "Ce nu funcționează?",
      descriptionPlaceholder: "ex. Mașina de spălat nu evacuează apa",
      photosLabel: "Fotografii (maximum 3)",
      applianceLabel: "Aparat (opțional)",
      noAppliance: "Nu știu sau niciunul dintre acestea",
      submit: "Raportează și diagnostichează",
      submitting: "Se diagnostichează…",
    },
    appliance: {
      categories: {
        FRIDGE: "Frigider",
        FREEZER: "Congelator",
        OVEN: "Cuptor",
        HOB: "Plită",
        MICROWAVE: "Cuptor cu microunde",
        DISHWASHER: "Mașină de spălat vase",
        WASHING_MACHINE: "Mașină de spălat rufe",
        DRYER: "Uscător de rufe",
        WASHER_DRYER: "Mașină de spălat cu uscător",
        AIR_CONDITIONER: "Aer condiționat",
        WATER_HEATER: "Boiler",
        EXTRACTOR_HOOD: "Hotă",
        TV: "Televizor",
        COFFEE_MACHINE: "Espressor",
        OTHER: "Altele",
      },
      categoryLabel: "Categorie",
      chooseCategory: "Alege o categorie",
      fieldLabels: {
        brand: "Marcă",
        model: "Model",
        serialNumber: "Număr de serie",
        manufactureDate: "Data fabricației",
        purchaseDate: "Data cumpărării",
        purchasePriceRon: "Preț de cumpărare (RON)",
        warrantyUntil: "Garanție până la",
        notes: "Notițe",
      },
      fieldPlaceholders: {
        brand: "ex. Bosch",
        model: "ex. WAN28262BY",
        manufactureDate: "AAAA, AAAA-LL sau AAAA-LL-ZZ",
      },
      empty: "Niciun aparat încă.",
      noBrandOrModel: "Fără marcă sau model",
      addAppliance: "Adaugă aparatul",
      detailsTitle: "Detalii",
      documentsTitle: "Documente",
      documentKinds: {
        LABEL_PHOTO: "Poza etichetei",
        INVOICE: "Factură",
        PHOTO: "Poză",
      },
      uploaded: (kind, date) => `${kind}, încărcată pe ${date}`,
      deleteAppliance: "Șterge aparatul",
      deleteConfirm:
        "Ștergi acest aparat? Poza etichetei și factura se șterg și ele, dacă nu le folosește alt aparat.",
    },
    newAppliance: {
      title: "Adaugă un aparat",
      labelPhotoTitle: "Poza etichetei",
      labelPhotoIntro:
        "Plăcuța cu date tehnice, de obicei în interiorul ușii sau pe spate.",
      readLabel: "Citește eticheta",
      readingLabel: "Se citește eticheta…",
      invoiceTitle: "Factură",
      invoiceIntro:
        "Poză sau PDF. Fiecare aparat de pe factură devine un rând de verificat.",
      readInvoice: "Citește factura",
      readingInvoice: "Se citește factura…",
      manualTitle: "Introdu manual",
      fileTooLarge: "Fișierul are peste 10 MB.",
    },
    documentReview: {
      titleInvoice: "Verifică factura",
      titleLabel: "Verifică eticheta",
      uploadedFileAlt: "Fișierul încărcat",
      openFile: "Deschide fișierul încărcat",
      alreadyReviewed: "Acest fișier a fost deja verificat.",
      checkFields:
        "Verifică fiecare câmp. Câmpurile evidențiate nu au putut fi citite.",
      couldNotRead: "Nu am putut citi acest fișier. Completează câmpurile tu.",
      addThisAppliance: "Adaugă acest aparat",
      howManyToAdd: (quantity) =>
        `${quantity} pe această factură. Câte adaugi?`,
      review: "Verifică",
      uploadedOn: (date) => `Încărcat pe ${date}`,
      discard: "Renunță",
      discardConfirm: "Renunți la acest fișier? Fișierul se șterge.",
    },
    team: {
      title: "Echipă",
      membersTitle: "Membri",
      owner: "Proprietar",
      manager: "Manager",
      remove: "Elimină",
      emergencyContactTitle: "Contact de urgență",
      emergencyContactIntro:
        "Oaspeții și personalul de curățenie văd acest număr când raportează o urgență.",
      contactPhoneLabel: "Telefon de contact",
      saved: "Salvat.",
      savePhone: "Salvează telefonul",
      inviteTitle: "Invită un manager",
      managerEmailLabel: "Emailul managerului",
      createInvite: "Creează linkul de invitație",
      sendLink: (email) =>
        `Trimite acest link către ${email}. Funcționează 7 zile și doar pentru acest email.`,
      shareOnWhatsApp: "Trimite pe WhatsApp",
      whatsAppMessage: (organizationName, invitationUrl) =>
        `Alătură-te organizației ${organizationName} în Turnover: ${invitationUrl}`,
      pendingTitle: "Invitații în așteptare",
      noPending: "Nicio invitație în așteptare.",
      expires: (date) => `Expiră pe ${date}`,
    },
  },
};

const countEnglish = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

// Romanian puts "de" before a plural noun when the number's last two digits are 00 or 20 and above.
const countRomanian = (count: number, one: string, plural: string) => {
  if (count === 1) return one;
  const lastTwoDigits = count % 100;
  const takesDe = count !== 0 && (lastTwoDigits === 0 || lastTwoDigits >= 20);
  return `${count} ${takesDe ? "de " : ""}${plural}`;
};
