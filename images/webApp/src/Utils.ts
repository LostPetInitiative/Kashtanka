
function getUnitForm(value:number, forms:[string,string,string])
{
    if (value >= 10 && value <= 20) {
        return forms[2];
    }
    else {
        switch (value % 10) {
            case 1: return forms[0];
            case 2:
            case 3:
            case 4: return forms[1];
            default: return forms[2];
        }
    }

}

export function getTimeDiffString(timeDiffMs: number) {
    var timeDiffStr: string;
    const oneSec = 1000
    const oneMin = 60 * oneSec
    const oneHour = 60 * oneMin
    const oneDay = 24 * oneHour
    const oneMonth = 30 * oneDay;
    const oneYear = 12 * oneMonth;
    if (timeDiffMs > oneYear) {
        const unitsDiff = Math.round(timeDiffMs / oneYear)
        timeDiffStr = unitsDiff.toFixed() + " " + getUnitForm(unitsDiff,["год","года","лет"])
    } else if (timeDiffMs > oneMonth) {
        const unitsDiff = Math.round(timeDiffMs / oneMonth)
        timeDiffStr = unitsDiff.toFixed() + " " + getUnitForm(unitsDiff,["месяц","месяца","месяцев"])
    } else if (timeDiffMs > oneDay) {
        const unitsDiff = Math.round(timeDiffMs / oneDay)
        timeDiffStr = unitsDiff.toFixed() + " "+ getUnitForm(unitsDiff,["день","дня","дней"])
    } else if (timeDiffMs > oneHour) {
        const unitsDiff = Math.round(timeDiffMs / oneHour)
        timeDiffStr = unitsDiff.toFixed() + " "+ getUnitForm(unitsDiff,["час","часа","часов"])
    } else if (timeDiffMs > oneMin) {
        const unitsDiff = Math.round(timeDiffMs / oneMin)
        timeDiffStr = unitsDiff.toFixed() + " "+ getUnitForm(unitsDiff,["минута","минуты","минут"])
    } else {
        const unitsDiff = Math.round(timeDiffMs / oneSec)
        timeDiffStr = unitsDiff.toFixed() + " "+ getUnitForm(unitsDiff,["секунда","секунды","секунд"])
    }
    return timeDiffStr;
}

export function getGeoDiffString(geoDistKM: number) {
    return (geoDistKM < 1.0) ? ((geoDistKM * 1000.0).toFixed(0) + " метров") : (geoDistKM.toFixed(0) + " км")
}