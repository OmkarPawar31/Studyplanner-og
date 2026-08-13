import { DailySchedule } from '../../components/timetable/DailySchedule';
import { WeekOutlook } from '../../components/timetable/WeekOutlook';
import { TimetableForm } from '../../components/timetable/TimetableForm';

export function Timetable() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="flex flex-col gap-6">
        <DailySchedule />
        <WeekOutlook />
      </div>
      <div className="xl:sticky xl:top-32 xl:self-start">
        <TimetableForm />
      </div>
    </div>);

}