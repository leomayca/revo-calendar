import { SupportedLang, LanguageTranslations } from "../../types/language";

export interface EventExtra {
  icon?: string;
  text: string;
}

export interface Events {
  name: string;
  date: string; // Alterado de number para string. Se preferir Date, ajuste conforme necessário.
  allDay?: boolean;
  extra?: EventExtra;
}

export interface SelectedDate {
  day: number;
  month: number;
  year: number;
}

export interface Props {
  style?: React.CSSProperties;
  className?: string;
  events?: Array<Events>;
  highlightToday?: boolean;
  lang?: SupportedLang; // Alterado de string para SupportedLang
  primaryColor?: string;
  secondaryColor?: string;
  todayColor?: string;
  textColor?: string;
  indicatorColor?: string;
  animationSpeed?: number;
  sidebarWidth?: number;
  detailWidth?: number;
  showDetailToggler?: boolean;
  detailDefault?: boolean;
  showSidebarToggler?: boolean;
  sidebarDefault?: boolean;
  onePanelAtATime?: boolean;
  allowDeleteEvent?: boolean;
  allowAddEvent?: boolean;
  openDetailsOnDateSelection?: boolean;
  timeFormat24?: boolean;
  showAllDayLabel?: boolean;
  detailDateFormat?: string;
  languages?: Record<SupportedLang, LanguageTranslations>;
  date?: Date;
  dateSelected?(date: SelectedDate): void;
  eventSelected?(index: number): void;
  addEvent?(date: Date): void;
  deleteEvent?(index: number): void;
}

// Styled Component Props

export interface SidebarProps {
  sidebarOpen: boolean;
  animatingIn: boolean;
  animatingOut: boolean;
}

export interface MonthButtonProps {
  current: boolean;
}

export interface DayProps {
  firstDay: boolean;
  firstOfMonth: number;
}

export interface DayButtonProps {
  current: boolean;
  today: boolean;
  hasEvent: boolean;
}

export interface DetailsProps {
  animatingIn: boolean;
  animatingOut: boolean;
  detailsOpen: boolean;
  floatingPanels: boolean;
}

export interface CloseDetailProps {
  animatingIn: boolean;
  animatingOut: boolean;
  detailsOpen: boolean;
}
