// ============================================
// MAH.AI — Clerk Theme Configuration
// ============================================
// Configuration partagée pour l'apparence
import { dark } from '@clerk/themes';

export const clerkAppearance = {
  baseTheme: dark,
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
    logoPlacement: "inside",
  },
  variables: {
    colorPrimary: '#0AFFE0',
    colorBackground: '#060910', // Global dark bg
    colorText: '#F0F4FF',
    colorTextSecondary: '#94A3B8',
    colorInputText: '#FFFFFF',
    colorInputBackground: '#0C1220',
    colorNeutral: '#94A3B8',
    colorDanger: '#FF6B9D',
    borderRadius: '14px',
    spacingUnit: '8px',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'bg-transparent w-full shadow-none',
    card: 'bg-transparent shadow-none border-0 p-0 m-0',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsBlockButton: 
      'bg-[#111928] border border-white/5 hover:bg-[#0A1628] hover:border-teal/30 transition-all duration-300 rounded-xl',
    socialButtonsBlockButtonText: 'text-white font-medium',
    dividerLine: 'bg-white/10',
    dividerText: 'text-white/60 font-bold text-[10px] uppercase tracking-widest',
    formFieldLabel: 'text-white/90 text-xs font-mono uppercase tracking-wider mb-2',
    formFieldInputShowPasswordButton: 'text-teal hover:text-teal2',
    
    // CHAMPS DE TEXTE PRINCIPAUX
    formFieldInput: 
      'bg-[#0C1220] border border-white/10 text-white placeholder:text-white/40 focus:border-teal/60 hover:border-white/20 transition-all duration-300 rounded-xl h-11 px-4 shadow-inner ring-0 focus:ring-1 focus:ring-teal/30',
    
    // HARMONISATION DROPDOWNS ET POPOVERS (Code pays, etc.)
    phoneInputBox: 'bg-[#0C1220] border border-white/10 rounded-xl text-white outline-none ring-0',
    selectButton: 'text-white border-0 bg-transparent py-0 h-10',
    selectButtonIcon: 'text-white/60',
    popoverContent: 'bg-[#0C1220] border border-white/10 shadow-xl rounded-xl custom-scrollbar',
    selectOption: 'text-white hover:bg-teal/10 hover:text-teal cursor-pointer',
    selectOptionContent: 'text-white',

    // BOUTON PRINCIPAL (Primary)
    formButtonPrimary: 
      'bg-teal hover:bg-teal2 text-[#060910] font-extrabold text-sm transition-all duration-300 rounded-xl h-11 mt-2 shadow-lg shadow-teal/10 hover:shadow-teal/20',

    // MESSAGES ET LIENS DE FOOTER
    footerActionLink: 'text-teal hover:text-teal2 font-black text-sm transition-colors',
    footerActionText: 'text-white/70 font-medium',
    identityPreviewEditButton: 'text-teal',
    formFieldErrorText: 'text-[#FF6B9D] text-xs mt-1', // --rose
    footer: 'pt-6', // On enlève le 'hidden' pour afficher le lien de connexion
    userButtonPopoverFooter: 'hidden',
    formFieldAction: 'text-teal hover:text-teal2 text-xs font-medium', 
    providerIcon__apple: 'filter invert',
    providerIcon__github: 'filter invert',
  },
}
