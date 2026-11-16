/* The "Calendar" component. It allows the employee to update his availability for customers. He can choose a month, then a date,
and lastly a time to set available/not available. The calendar also shows dates and times he has a booking. 
The employee can not choose available for saturdays or sundays*/

import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, addMonths, isSameDay } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchNotAvailableByMonthAndEmployeeId, updateNotAvailableByListAndMonthAndEmployeeId} from '@/app/api/notAvailable';
import { fetchServicesByMonthAndEmployeeId } from '@/app/api/service';
import { fetchEmployeeByEmail } from '@/app/api/employee';

import { getUser } from '@/app/authServerComponents/getUser';

const Calendar = () => {
  const [employee, setEmployee] = useState();
  const [employeeId, setEmployeeId] = useState();

  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [notAvailable, setNotAvailable] = useState([]);
  const [services, setServices] = useState([]);

  async function fetchEmployee() {
    try {
      const user = await getUser();
      const employee = await fetchEmployeeByEmail(user.email);
      setEmployee(employee);
      setEmployeeId(employee[0].employee_id)
    } catch (error) {
      console.error('Failed to fetch employee data');
    }
  }

  // Used to not generate dates and times before the data is fetched for the current month
  const [dataReady, setDataReady] = useState(false);

  function updateCalendar(){
    if (employeeId !== undefined) {
      Promise.all([
        fetchNotAvailableByMonthAndEmployeeId(startOfMonth(currentMonth).toISOString(), endOfMonth(currentMonth).toISOString(),
        employeeId),
        fetchServicesByMonthAndEmployeeId(startOfMonth(currentMonth).toISOString(), endOfMonth(currentMonth).toISOString(),
        employeeId)
      ]).then(([notAvailableData, servicesData]) => {
        setNotAvailable(notAvailableData);
        setServices(servicesData);
      });
    }
  }

  useEffect(() => {
    fetchEmployee();
  }, []);

  useEffect(() => {
    const today = new Date();
    
    // Checks if selected day is saturday or sunday
    if (today.getDay() === 6 || today.getDay() === 0) {
      // If so, add correct number of days to get the comming monday 
      setSelectedDate(addDays(today, today.getDay() === 6 ? 2 : 1));
    } else {
      setSelectedDate(today);
    }

    updateCalendar();
  }, [employeeId]);

  // Runs when notAvailable or services are set, and renders the date- and time-elements
  useEffect(() => {
    renderDateElements();
    renderTimeSlots();
    setDataReady(true);
  }, [notAvailable, services]);

  // Updates not_available in supabase for the given employee and month
  async function handleUpdateAvailability(){
    try {
      await updateNotAvailableByListAndMonthAndEmployeeId(notAvailable, startOfMonth(currentMonth).toISOString(),
       endOfMonth(currentMonth).toISOString(), employeeId);
  
    } catch (error) {
      console.error('Failed to update availability');
      toast.error('Someting went wrong. Could not update availability');
      return;
    }
    toast.success('Availability updated');
  };
  
  let days = [];

  // Renders the UI date-elements
  const renderDateElements = () => {
    days = [];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const dateFormat = "d";
    let day = startDate;
    let formattedDate = "";

    // Loop that creates the date-elements, and gives styling based on whether or not the date has available time-slots, 
    // is a weekend-day, or has a booking
    while (day <= endDate) {
      formattedDate = format(day, dateFormat);
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const isSameDayAsBooking = services.some(service => {
        return service.booking && isSameDay(new Date(service.booking.booking_date), day); 
    });
    
      // Checks if all times for a given date are unavailable
      let numOfUnavailableTimes = 0;
      notAvailable.forEach(notAvail => {
        const notAvailableDate = new Date(notAvail.date);
        if (isSameDay(notAvailableDate, day)) {
          numOfUnavailableTimes++;
        }
      });
      const allTimesUnavailable = numOfUnavailableTimes === 8;
      
      // Creates a copy to avoid that the last date in the loop always gets used in handleDateSelection
      const dayCopy = new Date(day);

      const dateClassNames = [
        'dateNumber',
        'rounded-md',
        'overflow-hidden',
        'cursor-pointer',
        isWeekend ? 'opacity-50 pointer-events-none' : '',
        allTimesUnavailable ? 'opacity-50' : '',
        isSameDayAsBooking ? 'border border-blue-600 border-4' : '',
        isSameDay(dayCopy, selectedDate) ? 'bg-gray-300' : ''
      ].filter(className => className !== '').join(' ');

      days.push(
        <div
          key={day}
          className={`col cell ${!isSameMonth(day, monthStart) ? "disabled" : ""}`}
          style={!isSameMonth(day, monthStart) ? { opacity: 0, pointerEvents: 'none' } : {}}
          onClick={() => !isWeekend && handleDateSelection(dayCopy)}
        >
          <span 
            className={dateClassNames}
          >
            {formattedDate}
          </span>
        </div>
      );
      day = addDays(day, 1);
    }
  }
  renderDateElements();

  // Methods to selects previous/next month
  function nextMonth() {
    if(dataReady){
      setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
      setDataReady(false);
    }
  };

  function prevMonth() {
    if(dataReady){
      setCurrentMonth((prevMonth) => addMonths(prevMonth, -1));
      setDataReady(false);
    }
  };

  // Runs after currentMonth changes (to ensure updateCalendar does not use the state before it updates)
  useEffect(() => {
    const firstDayOfMonth = startOfMonth(currentMonth);

    // Checks if selected date is a saturday or sunday
    if (firstDayOfMonth.getDay() === 6 || firstDayOfMonth.getDay() === 0) {
      // Add correct number of days to get the comming monday
      setSelectedDate(addDays(firstDayOfMonth, firstDayOfMonth.getDay() === 6 ? 2 : 1));
    } else {
      setSelectedDate(firstDayOfMonth);
    }

    updateCalendar();
  }, [currentMonth]);


  const handleDateSelection = (selectedDay) => {
      setSelectedDate(selectedDay);
  };

  const handleTimeSelection = (selectedHour) => {
    if (selectedDate) {
        const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

        // Checks that date and time are not booked (then the employee should not be able to change availability)
        if (!(services.some(service =>  service.booking &&
        isSameDay(new Date(service.booking.booking_date), selectedDate) 
        && service.booking.booking_time === `${selectedHour < 10 ? '0' + selectedHour : selectedHour}:00:00`))) {
          const existingUnavailableIndex = notAvailable.findIndex(item => item.date === selectedDateString 
            && item.time === `${selectedHour < 10 ? '0' + selectedHour : selectedHour}:00:00`);
          // Checks if the time is already unavailable
          if (existingUnavailableIndex !== -1) {
              // Remove time from notAvailable if it is already there
              const updatedUnavailable = [...notAvailable];
              updatedUnavailable.splice(existingUnavailableIndex, 1);
              setNotAvailable(updatedUnavailable);
              
          } else {
              // Add time to notAvailable if it is not there
              setNotAvailable(prev => [...prev, { date: selectedDateString, time: `${selectedHour < 10 ? '0' + selectedHour : selectedHour}:00:00` }]);
          }
        }
    }
  };

  // When user selects entire day
  const handleSelectAll = () => {
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

    // Checks if all times are unavailable
    const allTimesUnavailable = Array.from({ length: 8 }, (_, i) => i + 9).every(hour => {
      return notAvailable.some(item => item.date === selectedDateString && item.time === `${hour < 10 ? '0' + hour : hour}:00:00`);
    });
    
    // If all times are unavailable, set them to available (won't work if date has a booking)
    if (allTimesUnavailable) {
      for (let hour = 9; hour < 17; hour++) {
        if (selectedDate) {
          // Checks that date and time are not booked
          if (!(services.some(service =>  service.booking &&
            isSameDay(new Date(service.booking.booking_date), selectedDate) 
            && service.booking.booking_time === `${hour < 10 ? '0' + hour : hour}:00:00`))) {
              const existingUnavailableIndex = notAvailable.findIndex(item => item.date === selectedDateString 
                && item.time === `${hour < 10 ? '0' + hour : hour}:00:00`);
              // Checks if the time is unavailable, if so remove it
              if (existingUnavailableIndex !== -1) {
                  // Remove time from notAvailable if it is there
                  setNotAvailable(prev => prev.filter(item => !(item.date === selectedDateString)));
              } 
          }
        }
      }
    }
    // If at least 1 time is available, set all to not available
    else{
      for (let hour = 9; hour < 17; hour++) {
        if (selectedDate) {
            // Checks that date and time are not booked
            if (!(services.some(service =>  service.booking &&
              isSameDay(new Date(service.booking.booking_date), selectedDate) 
              && service.booking.booking_time === `${hour < 10 ? '0' + hour : hour}:00:00`))) {
                const existingUnavailableIndex = notAvailable.findIndex(item => item.date === selectedDateString 
                  && item.time === `${hour < 10 ? '0' + hour : hour}:00:00`);
                // Checks if the time is already unavailable, if so do nothing
                if (existingUnavailableIndex !== -1) {
                    
                } else {
                    // Add time to notAvailble if it is not there
                    setNotAvailable(prev => [...prev, { date: selectedDateString, time: `${hour < 10 ? '0' + hour : hour}:00:00` }]);
                }
            }
        }
      }
    }
  };

 // Renders the UI time-slots
  const renderTimeSlots = () => {
    return Array.from({ length: 8 }, (_, i) => i + 9).map((hour) => {
      const formattedHour = `${hour}:00`;
      const hourForDb = `${hour < 10 ? '0' + hour : hour}:00:00`;

      const isNotAvail = notAvailable.some(notAvail => isSameDay(new Date(notAvail.date), selectedDate) && notAvail.time === hourForDb);
      const isBooking = services.some(service => service.booking &&
        isSameDay(new Date(service.booking.booking_date), selectedDate) 
        && service.booking.booking_time === hourForDb);
    
      const hourCopy = hour;
     
      const timeClassNames = [
        'border',
        'border-gray-200',
        'rounded-md',
        'p-2',
        'mb-2',
        'cursor-pointer',
        isNotAvail ? 'opacity-50' : '',
        isBooking ? 'border border-blue-500 border-4' : '',
      ].filter(className => className !== '').join(' ');
      if(hour == 9){
        return (
          <div>
            <div
            key="select-all"
            className="border border-gray-200 rounded-md p-2 mb-2 cursor-pointer text-center"
            onClick={handleSelectAll}
            >
              Choose entire day
            </div> 

            <div
              key={hour}
              className={timeClassNames}
              onClick={() => handleTimeSelection(hourCopy)}
            >
              {formattedHour}
            </div>
          </div>
        )
      }
      else{
        return (
          <div
            key={hour}
            className={timeClassNames}
            onClick={() => handleTimeSelection(hourCopy)}
          >
            {formattedHour}
          </div>
        ); 
      }
      
    });
  };
  
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth}>{'<'}</button>
        <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth}>{'>'}</button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>
      <div className="flex flex-col">
        {renderTimeSlots()}
      </div>
      <button className="bg-brand-base-500 hover:bg-brand-base-600 active:bg-brand-base-900 text-white font-bold py-2 px-4 rounded mt-2"
        onClick={handleUpdateAvailability}>
        Update
      </button>
      <ToastContainer />
    </div>
  );
};

export default Calendar;