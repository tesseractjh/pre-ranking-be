import { CLOSED_DAYS, NEXT_DATE_RATIO } from '../constants';
import random from './random';

const DAY = 24 * 60 * 60 * 1000;

const stockDate = {
  getDateInfo(dateObj: Date) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const date = dateObj.getDate();
    const day = dateObj.getDay();
    const hour = dateObj.getHours();
    return { year, month, date, day, hour };
  },

  formatDateWithHyphen(dateObj: Date) {
    const { year, month, date } = this.getDateInfo(dateObj);
    return `${year}-${month.toString().padStart(2, '0')}-${date
      .toString()
      .padStart(2, '0')}`;
  },

  formatDate(dateObj: Date) {
    const { year, month, date } = this.getDateInfo(dateObj);
    return `${year}${month.toString().padStart(2, '0')}${date
      .toString()
      .padStart(2, '0')}`;
  },

  getLastDate() {
    const today = new Date();
    const { day, hour } = this.getDateInfo(today);

    if (day === 0) {
      today.setTime(today.getTime() - 2 * DAY);
    } else if (day === 6) {
      today.setTime(today.getTime() - DAY);
    } else if (day === 1 && hour < 12) {
      today.setTime(today.getTime() - 3 * DAY);
    } else if (hour < 12) {
      today.setTime(today.getTime() - DAY);
    }

    let i = 0;
    while (i < 100) {
      i += 1;
      today.setTime(today.getTime() - DAY);
      const { day } = this.getDateInfo(today);

      if (
        day > 0 &&
        day < 6 &&
        !CLOSED_DAYS.includes(this.formatDateWithHyphen(today))
      ) {
        break;
      }
    }

    return today;
  },

  getRandomNextDate(lastDate: Date) {
    const date = new Date(lastDate);
    const day = lastDate.getDay();
    const diff = random.getRandomNumberFromRatio(NEXT_DATE_RATIO);

    if (diff <= 5 && day === 4) {
      date.setTime(lastDate.getTime() + 5 * DAY);
    } else if (diff <= 4 && day === 5) {
      date.setTime(lastDate.getTime() + 4 * DAY);
    } else {
      date.setTime(lastDate.getTime() + diff * DAY);
    }

    let i = 0;
    while (i < 100) {
      i += 1;
      date.setTime(date.getTime() + DAY);
      const { day } = this.getDateInfo(date);

      if (
        day > 0 &&
        day < 6 &&
        !CLOSED_DAYS.includes(this.formatDateWithHyphen(date))
      ) {
        break;
      }
    }

    return `${this.formatDateWithHyphen(date)} 12:00:00`;
  },

  getDateDiff(prevDate: Date | string, curDate: Date | string) {
    const prevDateObj = new Date(prevDate);
    const curDateObj = new Date(curDate);
    return Math.ceil((curDateObj.getTime() - prevDateObj.getTime()) / DAY) - 1;
  }
};

export default stockDate;
