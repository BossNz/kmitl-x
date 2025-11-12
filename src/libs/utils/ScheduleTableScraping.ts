import type { ScheduleI, InformationI } from "../types";

export default class ScheduleTableScraping {
  private scheduleTable: HTMLTableElement;
  constructor(scheduleTable: HTMLTableElement) {
    this.scheduleTable = scheduleTable;
  }

  public getStudent = (): InformationI => {
    const studyTableRows = this.scheduleTable.querySelectorAll("tr");
    return {
      faculty: this.removeNewlinesAndSpaces(studyTableRows[8].textContent),
      department: this.removeNewlinesAndSpaces(
        studyTableRows[10].childNodes[1].childNodes[1].textContent
      ),
      major: this.removeNewlinesAndSpaces(
        studyTableRows[10].childNodes[1].childNodes[3].textContent
      ),
      Semester: this.removeNewlinesAndSpaces(
        studyTableRows[12].childNodes[1].childNodes[1].textContent
      ),
      year: this.removeNewlinesAndSpaces(
        studyTableRows[12].childNodes[1].childNodes[3].textContent
      ),
      studentID: this.removeNewlinesAndSpaces(
        studyTableRows[14].childNodes[1].childNodes[1].textContent
      ),
      name:
        studyTableRows[14].childNodes[1].childNodes[3].textContent?.slice(1) ??
        "",
    };
  };

  private removeNewlinesAndSpaces = (text: string | null): string => {
    if (text == null) return "";
    return text.replace(/[\n\s]/g, "");
  };

  public getSchedule = (): ScheduleI[] => {
    const scheduleData: Array<ScheduleI> = [];
    const studyTableRows = this.scheduleTable.querySelectorAll("tr");

    const studyTableRowsArray = Array.from(studyTableRows)
      .filter((item) => item.childNodes.length === 37)
      .slice(1);

    for (const data of studyTableRowsArray) {
      const timeText = data.childNodes[25].textContent ?? "";
      const matches = timeText.match(/((?:[ก-ฮ]{1,2}|อา)\.\s*\d{2}:\d{2}-\d{2}:\d{2}\s*น?\.?\([ทป]\))/g) || [];
      for (let i = 0; i < matches.length; i++) {
        const tempNode = data.childNodes;
        tempNode[25].textContent = matches[i].trim();
        scheduleData.push(this.parseScheduleData(tempNode));
      }
    }

    return this.sortDateTime(scheduleData);
  };

  private parseScheduleData = (
    childNodes: NodeListOf<ChildNode>,
    offset: number = 0
  ): ScheduleI => {
    return {
      order: childNodes[1].textContent ?? "",
      code: childNodes[5].textContent ?? "",
      name: childNodes[9].textContent ?? "",
      credits: childNodes[13].textContent ?? "",
      theory: childNodes[17].textContent ?? "",
      practice: childNodes[21].textContent ?? "",
      time: {
        day: this.getInnerTextOrChildText(childNodes[25], offset).split(" ")[0],
        start: this.getInnerTextOrChildText(childNodes[25], offset)
          .split(" ")[1]
          .split("-")[0],
        end: this.getInnerTextOrChildText(childNodes[25], offset)
          .split(" ")[1]
          .split("-")[1],
        type:
          this.getInnerTextOrChildText(childNodes[25], offset)
            .split(" ")[2]
            .replaceAll(/น\.|\(|\)/g, "")[0] == "ท"
            ? "ทฤษฏี"
            : "ปฏิบัติ",
      },
      room: this.getInnerTextOrChildText(childNodes[29], offset),
      building: this.getInnerTextOrChildText(childNodes[33], offset),
      note: childNodes[35].textContent ?? "",
    };
  };

  private getInnerTextOrChildText = (node: Node, offset: number = 0): string =>
    node.childNodes.length > 0
      ? node.childNodes[offset].textContent ?? ""
      : node.textContent ?? "";

  private sortDateTime = (data: Array<ScheduleI>): Array<ScheduleI> => {
    return data
      .sort((a, b) => {
        const timeToMinutes = (time: string) => {
          const [hours, minutes] = time.split(":");
          return parseInt(hours) * 60 + parseInt(minutes);
        };
        return timeToMinutes(a.time.start) - timeToMinutes(b.time.start);
      })
      .sort((a, b) => {
        const order = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "อา."];
        return order.indexOf(a.time.day) - order.indexOf(b.time.day);
      });
  };
}
