import React, { useState, useEffect, useRef } from "react";

import helperFunctions from "./helpers/functions";
import translations from "./helpers/translations";

import { Props } from "./typings"; // Removido 'Events'
import {
  CHEVRON_ICON_SVG,
  CLOCK_ICON_SVG,
  DETAILS_ICON_SVG,
  SIDEBAR_ICON_SVG,
} from "./helpers/consts";

import { ThemeProvider } from "styled-components";
import {
  Calendar,
  CloseDetail,
  CloseSidebar,
  Day,
  DayButton,
  Details,
  Event as StyledEvent,
  Inner,
  MonthButton,
  Sidebar,
} from "./styles";

const RevoCalendar: React.FC<Props> = ({
  style = {},
  className = "",
  events = [],
  highlightToday = true,
  lang = "en",
  primaryColor = "#4F6995",
  secondaryColor = "#c4dce9",
  todayColor = "#3B3966",
  textColor = "#333333",
  indicatorColor = "orange",
  animationSpeed = 300,
  sidebarWidth = 180,
  detailWidth = 280,
  showDetailToggler = true,
  detailDefault = true,
  showSidebarToggler = true,
  sidebarDefault = true,
  onePanelAtATime = false,
  allowDeleteEvent = false,
  allowAddEvent = false,
  openDetailsOnDateSelection = true,
  timeFormat24 = true,
  showAllDayLabel = false,
  detailDateFormat = "DD/MM/YYYY",
  languages: languagesProp = translations,
  date = new Date(),
  dateSelected = () => {},
  eventSelected = () => {},
  addEvent = () => {},
  deleteEvent = () => {},
}: Props) => {
  // Transformar cores passadas em RGB
  const primaryColorRGB = helperFunctions.getRGBColor(primaryColor);
  const secondaryColorRGB = helperFunctions.getRGBColor(secondaryColor);
  const todayColorRGB = helperFunctions.getRGBColor(todayColor);
  const indicatorColorRGB = helperFunctions.getRGBColor(indicatorColor);
  const textColorRGB = helperFunctions.getRGBColor(textColor);

  const calendarRef = useRef<HTMLDivElement>(null);

  // Hook para obter a largura do calendário
  function useCalendarWidth() {
    const [size, setSize] = useState(0);
    useEffect(() => {
      function updateSize() {
        if (calendarRef.current != null) {
          setSize(calendarRef.current.offsetWidth);
        }
      }
      if (typeof window !== "undefined")
        window.addEventListener("resize", updateSize);
      updateSize();
      return () => window.removeEventListener("resize", updateSize);
    }, [calendarRef]);
    return size;
  }

  const calendarWidth = useCalendarWidth();

  // Estados para variáveis que precisam ser modificadas
  const [isOnePanelAtATime, setIsOnePanelAtATime] = useState(onePanelAtATime);
  const [isDetailDefault, setIsDetailDefault] = useState(detailDefault);

  // Estados para controle de animações
  const [animatingSidebar, setAnimatingSidebar] = useState<number>(0); // -1 = fechando, 0 = nada, 1 = abrindo
  const [animatingDetail, setAnimatingDetail] = useState<number>(0); // -1 = fechando, 0 = nada, 1 = abrindo

  // Estados para controle de painéis
  const [sidebarOpen, setSidebarState] = useState(sidebarDefault);
  const [detailsOpen, setDetailsState] = useState(isDetailDefault);

  // Estados para seleção de data
  const [currentDay, setDay] = useState<number>(date.getDate());
  const [currentMonth, setMonth] = useState<number>(date.getMonth());
  const [currentYear, setYear] = useState<number>(date.getFullYear());

  // Atualizar seleção de data para o componente pai
  useEffect(() => {
    dateSelected({
      day: currentDay,
      month: currentMonth,
      year: currentYear,
    });
  }, [currentDay, currentMonth, currentYear, dateSelected]);

  // Ajustar layout baseado na largura do calendário
  useEffect(() => {
    if (calendarWidth <= 320 + sidebarWidth + detailWidth) {
      setIsOnePanelAtATime(true);
      if (sidebarDefault && isDetailDefault) {
        setIsDetailDefault(false);
      }
    }
  }, [
    calendarWidth,
    sidebarWidth,
    detailWidth,
    sidebarDefault,
    isDetailDefault,
  ]);

  // Determinar se os painéis devem flutuar
  const floatingPanels =
    calendarWidth <= 320 + sidebarWidth || calendarWidth <= 320 + detailWidth;

  // Ajustar larguras dos painéis se necessário
  const adjustedSidebarWidth =
    calendarWidth < sidebarWidth + 50 ? calendarWidth - 50 : sidebarWidth;
  const adjustedDetailWidth =
    calendarWidth < detailWidth + 50 ? calendarWidth - 50 : detailWidth;

  // Atualizar estado de detalhes com base na largura
  useEffect(() => {
    if (
      sidebarOpen &&
      detailsOpen &&
      calendarWidth <= 320 + adjustedSidebarWidth + adjustedDetailWidth
    ) {
      setAnimatingDetail(-1);
      setDetailsState(false);
    }
  }, [
    calendarWidth,
    sidebarOpen,
    detailsOpen,
    adjustedSidebarWidth,
    adjustedDetailWidth,
  ]);

  /***********************
   * CALENDAR COMPONENTS *
   ***********************/
  function CalendarSidebar() {
    function prevYear() {
      setYear(currentYear - 1);
    }

    function nextYear() {
      setYear(currentYear + 1);
    }

    // Finalizar animação
    function handleAnimationEnd() {
      setAnimatingSidebar(0);
    }

    function toggleSidebar() {
      // TODO
      const newAnimatingSidebar = sidebarOpen ? -1 : 1;
      setAnimatingSidebar(newAnimatingSidebar);
      setSidebarState(!sidebarOpen);

      // Fechar detalhes se necessário
      if (newAnimatingSidebar === 1 && isOnePanelAtATime && detailsOpen) {
        setAnimatingDetail(-1);
        setDetailsState(false);
      }
    }

    function ChevronButton({
      angle,
      color,
      action,
      ariaLabel,
    }: {
      angle: number;
      color: string;
      action(): void;
      ariaLabel: string;
    }) {
      return (
        <button
          onClick={action}
          aria-label={ariaLabel}
          style={{ cursor: "pointer", background: "none", border: "none" }}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="1em"
            height="1em"
            style={{ transform: `rotate(${angle}deg)` }}
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 8 8"
          >
            <path d={CHEVRON_ICON_SVG} fill={color} />
            <rect x="0" y="0" width="8" height="8" fill="rgba(0, 0, 0, 0)" />
          </svg>
        </button>
      );
    }

    const currentLanguage = languagesProp[lang] || languagesProp["en"];

    return (
      <>
        <Sidebar
          animatingIn={animatingSidebar === 1}
          animatingOut={animatingSidebar === -1}
          sidebarOpen={sidebarOpen}
          onAnimationEnd={handleAnimationEnd}
        >
          <div>
            <ChevronButton
              angle={90}
              color={secondaryColorRGB}
              action={prevYear}
              ariaLabel={currentLanguage.previousYear}
            />
            <span>{currentYear}</span>
            <ChevronButton
              angle={270}
              color={secondaryColorRGB}
              action={nextYear}
              ariaLabel={currentLanguage.nextYear}
            />
          </div>
          <div>
            <ul>
              {currentLanguage.months.map((month: string, i: number) => (
                <li key={i}>
                  <MonthButton
                    current={i === currentMonth}
                    onClick={() => setMonth(i)}
                  >
                    {month}
                  </MonthButton>
                </li>
              ))}
            </ul>
          </div>
        </Sidebar>
        {showSidebarToggler && (
          <CloseSidebar // TODO
            onClick={toggleSidebar}
            animatingIn={animatingSidebar === 1}
            animatingOut={animatingSidebar === -1}
            sidebarOpen={sidebarOpen}
            aria-label={currentLanguage.toggleSidebar}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill={secondaryColorRGB} d={SIDEBAR_ICON_SVG} />
            </svg>
          </CloseSidebar>
        )}
      </>
    );
  }

  function CalendarInner() {
    // Obter lista de dias do mês, considerando anos bissextos
    const daysInMonths = helperFunctions.getDaysInMonths(currentYear); // Certifique-se de que essa função retorna array com 12 elementos

    const days: JSX.Element[] = [];
    for (let index = 1; index <= daysInMonths[currentMonth]; index++) {
      const isToday = helperFunctions.isToday(index, currentMonth, currentYear);
      const highlight = isToday && highlightToday;
      let hasEvent = false;

      for (let event of events) {
        const eventDate = new Date(event.date);
        const currentDate = new Date(currentYear, currentMonth, index);

        // Remover tempo para comparação
        eventDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        if (eventDate.getTime() === currentDate.getTime()) {
          hasEvent = true;
          break;
        }
      }

      const day = (
        <DayButton
          key={index}
          today={highlight}
          current={index === currentDay}
          hasEvent={hasEvent}
          onClick={() => {
            setDay(index);
            if (openDetailsOnDateSelection && !detailsOpen) {
              setAnimatingDetail(1);
              setDetailsState(true);
              // Fechar sidebar se necessário
              if (isOnePanelAtATime && sidebarOpen) {
                setAnimatingSidebar(-1);
                setSidebarState(false);
              }
            }
          }}
        >
          <span>{index}</span>
        </DayButton>
      );
      days.push(day);
    }

    const currentLanguage = languagesProp[lang] || languagesProp["en"];

    return (
      <Inner
        onClick={() => {
          if (floatingPanels) {
            if (sidebarOpen) {
              setAnimatingSidebar(-1);
              setSidebarState(false);
            } else if (detailsOpen) {
              setAnimatingDetail(-1);
              setDetailsState(false);
            }
          }
        }}
      >
        <h1>{currentLanguage.months[currentMonth]}</h1>
        <div>
          <div>
            {currentLanguage.daysShort.map((weekDay: string) => (
              <div key={weekDay}>{weekDay.toUpperCase()}</div>
            ))}
          </div>
          <div>
            {days.map((day, i) => (
              <Day
                firstDay={i === 0}
                key={i}
                firstOfMonth={
                  helperFunctions.getFirstWeekDayOfMonth(
                    currentMonth,
                    currentYear
                  ) + 1
                }
              >
                {day}
              </Day>
            ))}
          </div>
        </div>
      </Inner>
    );
  }

  function CalendarDetails() {
    const selectedDate = new Date(currentYear, currentMonth, currentDay);

    // Estado para mostrar botão de deletar
    const [showDelete, setDeleteState] = useState<number>(-1);

    // Finalizar animação
    function handleAnimationEnd() {
      setAnimatingDetail(0);
    }

    function toggleDetails() {
      // TODO
      const newAnimatingDetail = detailsOpen ? -1 : 1;
      setAnimatingDetail(newAnimatingDetail);
      setDetailsState(!detailsOpen);

      // Fechar sidebar se necessário
      if (newAnimatingDetail === 1 && isOnePanelAtATime && sidebarOpen) {
        setAnimatingSidebar(-1);
        setSidebarState(false);
      }
    }

    function toggleDeleteButton(i: number) {
      // Enviar evento selecionado para o pai
      eventSelected(i);

      if (allowDeleteEvent) {
        setDeleteState((prev) => (prev === i ? -1 : i));
      }
    }

    const currentLanguage = languagesProp[lang] || languagesProp["en"];

    const eventDivs = events
      .map((event, index) => {
        const eventDate = new Date(event.date);
        const selectedDateNoTime = new Date(selectedDate);
        selectedDateNoTime.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        if (
          helperFunctions.isValidDate(eventDate) &&
          eventDate.getTime() === selectedDateNoTime.getTime()
        ) {
          return (
            <StyledEvent
              key={index}
              onClick={() => toggleDeleteButton(index)}
              role="button"
            >
              <p>{event.name}</p>
              <div>
                {event.allDay ? (
                  showAllDayLabel && (
                    <div aria-label={currentLanguage.eventTime}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path fill={primaryColorRGB} d={CLOCK_ICON_SVG} />
                      </svg>
                      <span>{currentLanguage.allDay}</span>
                    </div>
                  )
                ) : (
                  <div>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill={primaryColorRGB} d={CLOCK_ICON_SVG} />
                    </svg>
                    <span>
                      {helperFunctions.getFormattedTime(
                        eventDate,
                        timeFormat24
                      )}
                    </span>
                  </div>
                )}
                {event.extra && (
                  <div>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill={primaryColorRGB} d={event.extra.icon} />
                    </svg>
                    <span>{event.extra.text}</span>
                  </div>
                )}
              </div>
              {showDelete === index && (
                <button
                  onClick={() => deleteEvent(index)}
                  aria-label={currentLanguage.delete}
                >
                  {currentLanguage.delete}
                </button>
              )}
            </StyledEvent>
          );
        }
        return null;
      })
      .filter(Boolean); // Remover elementos nulos

    // Adicionar mensagem de nenhum evento
    if (eventDivs.length === 0) {
      eventDivs.push(<p key="no-event">{currentLanguage.noEventForThisDay}</p>);
    }

    return (
      <>
        <Details
          animatingIn={animatingDetail === 1}
          animatingOut={animatingDetail === -1}
          detailsOpen={detailsOpen}
          floatingPanels={floatingPanels}
          onAnimationEnd={handleAnimationEnd}
        >
          <div>
            {helperFunctions.getFormattedDate(
              selectedDate,
              detailDateFormat,
              lang,
              languagesProp
            )}
            {allowAddEvent && (
              <button
                onClick={() =>
                  addEvent(new Date(currentYear, currentMonth, currentDay))
                }
              >
                {currentLanguage.addEvent}
              </button>
            )}
          </div>
          <div>{eventDivs.map((event) => event)}</div>
        </Details>
        {showDetailToggler && (
          <CloseDetail // TODO
            onClick={toggleDetails}
            animatingIn={animatingDetail === 1}
            animatingOut={animatingDetail === -1}
            detailsOpen={detailsOpen}
            aria-label={currentLanguage.toggleDetails}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill={secondaryColorRGB} d={DETAILS_ICON_SVG} />
            </svg>
          </CloseDetail>
        )}
      </>
    );
  }

  /**************************
   * RENDER ACTUAL CALENDAR *
   **************************/
  return (
    <ThemeProvider
      theme={{
        primaryColor: primaryColorRGB,
        primaryColor50: helperFunctions.getRGBAColorWithAlpha(
          primaryColorRGB,
          0.5
        ),
        secondaryColor: secondaryColorRGB,
        todayColor: todayColorRGB,
        textColor: textColorRGB,
        indicatorColor: indicatorColorRGB,
        animationSpeed: `${animationSpeed}ms`,
        sidebarWidth: `${adjustedSidebarWidth}px`,
        detailWidth: `${adjustedDetailWidth}px`,
      }}
    >
      <Calendar className={className} ref={calendarRef} style={style}>
        <CalendarSidebar />
        <CalendarInner />
        <CalendarDetails />
      </Calendar>
    </ThemeProvider>
  );
};

export default RevoCalendar;
