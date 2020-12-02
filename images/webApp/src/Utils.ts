
export function getTimeDiffString(timeDiffMs: number) {
    var timeDiffStr: string;
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMonth = 30 * oneDay;
    const oneYear = 12 * oneMonth;
    if (timeDiffMs > oneYear) {
        timeDiffStr = (timeDiffMs / oneYear).toFixed(1) + " лет"
    } else if (timeDiffMs > oneMonth) {
        timeDiffStr = (timeDiffMs / oneMonth).toFixed() + " месяцев"
    } else {
        timeDiffStr = (timeDiffMs / oneDay).toFixed() + " дней"
    }
    return timeDiffStr;
}

export function getGeoDiffString(geoDistKM: number) {
    return (geoDistKM < 1.0) ? ((geoDistKM * 1000.0).toFixed(0) + " метров"): (geoDistKM.toFixed(0) + " км")
}