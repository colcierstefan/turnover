import type {
  EmergencyType,
  ReporterLanguage,
} from "@turnover/core/issue/constants/issue.constants";

type EmergencyText = { title: string; steps: ReadonlyArray<string> };

type IssueReportText = {
  title: (unitName: string) => string;
  invalidLink: string;
  roleLabel: string;
  guest: string;
  cleaner: string;
  nameLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  photosLabel: string;
  tooManyPhotos: string;
  photoTooLarge: string;
  photoNotSupported: string;
  submit: string;
  sending: string;
  tooManyReports: string;
  sendFailed: string;
  followUpsTitle: string;
  followUpsIntro: string;
  answerPlaceholder: string;
  continue: string;
  tipsTitle: string;
  tipsIntro: string;
  fixed: string;
  stillBroken: string;
  sentTitle: string;
  sentBody: string;
  fixedTitle: string;
  fixedBody: string;
  stepFailed: string;
  emergencyIntro: string;
  callHost: string;
  callEmergency: string;
  emergencies: Record<EmergencyType, EmergencyText>;
};

export const ISSUE_REPORT_TEXT: Record<ReporterLanguage, IssueReportText> = {
  EN: {
    title: (unitName) => `Report a problem in ${unitName}`,
    invalidLink: "This link is no longer valid.",
    roleLabel: "I am",
    guest: "Guest",
    cleaner: "Cleaner",
    nameLabel: "Your name (optional)",
    descriptionLabel: "What is wrong?",
    descriptionPlaceholder: "e.g. The washing machine does not start",
    photosLabel: "Photos (up to 3)",
    tooManyPhotos: "Choose at most 3 photos.",
    photoTooLarge: "Each photo must be under 10 MB.",
    photoNotSupported: "Only photos can be added.",
    submit: "Send report",
    sending: "Sending…",
    tooManyReports:
      "Too many reports were sent for this apartment in the last hour. Please contact your host directly.",
    sendFailed: "The report could not be sent. Please try again.",
    followUpsTitle: "A few quick questions",
    followUpsIntro:
      "Your report was sent. Your answers help your host fix it faster.",
    answerPlaceholder: "Your answer",
    continue: "Continue",
    tipsTitle: "Things you can try",
    tipsIntro:
      "Your report was sent to your host. While you wait, these may help:",
    fixed: "That fixed it",
    stillBroken: "Still broken",
    sentTitle: "Report sent",
    sentBody: "Thank you. Your host has your report and will take care of it.",
    fixedTitle: "Glad it works again",
    fixedBody: "Thank you. We let your host know it is fixed.",
    stepFailed: "Something went wrong, but your host already has your report.",
    emergencyIntro: "Your report was sent to your host. Do this now:",
    callHost: "Call your host",
    callEmergency: "Call 112",
    emergencies: {
      GAS_SMELL: {
        title: "Possible gas leak",
        steps: [
          "Do not switch lights or any electrical device on or off.",
          "Do not light a flame or smoke.",
          "Open the windows.",
          "Close the gas valve if you can reach it safely.",
          "Leave the apartment and call 112 from outside.",
        ],
      },
      WATER_LEAK: {
        title: "Water leak",
        steps: [
          "Close the main water valve if you know where it is.",
          "Stay away from sockets and electrical appliances near the water.",
          "Call your host now.",
        ],
      },
      ELECTRICAL_BURNING: {
        title: "Electrical burning smell",
        steps: [
          "Stop using the appliance or socket. Unplug it only if it is safe to touch.",
          "Never use water on anything electrical.",
          "If it is safe, switch off the power at the breaker panel.",
          "If you see smoke or fire, leave the apartment and call 112.",
        ],
      },
    },
  },
  RO: {
    title: (unitName) => `Raportează o problemă în ${unitName}`,
    invalidLink: "Acest link nu mai este valid.",
    roleLabel: "Sunt",
    guest: "Oaspete",
    cleaner: "Personal de curățenie",
    nameLabel: "Numele tău (opțional)",
    descriptionLabel: "Ce nu funcționează?",
    descriptionPlaceholder: "ex. Mașina de spălat nu pornește",
    photosLabel: "Fotografii (maximum 3)",
    tooManyPhotos: "Alege cel mult 3 fotografii.",
    photoTooLarge: "Fiecare fotografie trebuie să aibă sub 10 MB.",
    photoNotSupported: "Poți adăuga doar fotografii.",
    submit: "Trimite raportul",
    sending: "Se trimite…",
    tooManyReports:
      "Au fost trimise prea multe rapoarte pentru acest apartament în ultima oră. Te rugăm să contactezi direct gazda.",
    sendFailed: "Raportul nu a putut fi trimis. Te rugăm să încerci din nou.",
    followUpsTitle: "Câteva întrebări rapide",
    followUpsIntro:
      "Raportul a fost trimis. Răspunsurile tale ajută gazda să rezolve problema mai repede.",
    answerPlaceholder: "Răspunsul tău",
    continue: "Continuă",
    tipsTitle: "Ce poți încerca",
    tipsIntro:
      "Raportul a fost trimis gazdei. Până atunci, acestea te-ar putea ajuta:",
    fixed: "Asta a rezolvat problema",
    stillBroken: "Tot nu funcționează",
    sentTitle: "Raport trimis",
    sentBody: "Mulțumim. Gazda a primit raportul și se va ocupa de problemă.",
    fixedTitle: "Ne bucurăm că funcționează din nou",
    fixedBody: "Mulțumim. I-am transmis gazdei că problema s-a rezolvat.",
    stepFailed: "A apărut o eroare, dar gazda a primit deja raportul tău.",
    emergencyIntro: "Raportul a fost trimis gazdei. Fă acum următoarele:",
    callHost: "Sună gazda",
    callEmergency: "Sună la 112",
    emergencies: {
      GAS_SMELL: {
        title: "Posibilă scurgere de gaz",
        steps: [
          "Nu aprinde și nu stinge luminile sau alte aparate electrice.",
          "Nu aprinde nicio flacără și nu fuma.",
          "Deschide ferestrele.",
          "Închide robinetul de gaz dacă poți ajunge la el în siguranță.",
          "Ieși din apartament și sună la 112 de afară.",
        ],
      },
      WATER_LEAK: {
        title: "Scurgere de apă",
        steps: [
          "Închide robinetul principal de apă dacă știi unde este.",
          "Stai departe de prizele și aparatele electrice de lângă apă.",
          "Sună gazda acum.",
        ],
      },
      ELECTRICAL_BURNING: {
        title: "Miros de ars de la instalația electrică",
        steps: [
          "Nu mai folosi aparatul sau priza. Scoate aparatul din priză doar dacă îl poți atinge în siguranță.",
          "Nu turna niciodată apă pe ceva electric.",
          "Dacă este sigur, oprește curentul de la tabloul electric.",
          "Dacă vezi fum sau foc, ieși din apartament și sună la 112.",
        ],
      },
    },
  },
};
