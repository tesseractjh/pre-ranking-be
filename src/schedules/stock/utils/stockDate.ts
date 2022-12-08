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
    const { hour } = this.getDateInfo(today);

    if (hour < 12) {
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
    const diff = random.getRandomNumberFromRatio(NEXT_DATE_RATIO);
    lastDate.setTime(lastDate.getTime() + diff * DAY);

    let i = 0;
    while (i < 100) {
      i += 1;
      lastDate.setTime(lastDate.getTime() + DAY);
      const { day } = this.getDateInfo(lastDate);

      if (
        day > 0 &&
        day < 6 &&
        !CLOSED_DAYS.includes(this.formatDateWithHyphen(lastDate))
      ) {
        break;
      }
    }

    return `${this.formatDateWithHyphen(lastDate)} 12:00:00`;
  }
};

export default stockDate;
