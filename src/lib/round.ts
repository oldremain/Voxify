export const RoundMode = {
    ToPositiveInfinity: 0,
    AwayFromZero: 1,
    ToEven: 2,
    ToZero: 3,
    ToNegativeInfinity: 4
} as const

const roundToInt = (value: number, mode: (typeof RoundMode)[keyof typeof RoundMode]) => {
    let tmp = 0
    if (mode === RoundMode.ToEven) {
        const absValue = Math.abs(value)
        tmp = Math.floor(absValue)
        const fraction = absValue - tmp
        tmp += fraction > 0.5 || (fraction === 0.5 && tmp % 2) ? 1 : 0
    } else if (mode === RoundMode.AwayFromZero) {
        // https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
        tmp = Math.floor(Math.abs(value) + 0.5)
    } else if (mode === RoundMode.ToZero) {
        // https://en.wikipedia.org/wiki/Rounding#Round_half_toward_zero
        tmp = Math.ceil(Math.abs(value) - 0.5)
    } else if (mode === RoundMode.ToNegativeInfinity) {
        // https://en.wikipedia.org/wiki/Rounding#Round_half_down
        return Math.ceil(value - 0.5)
    } else if (mode === RoundMode.ToPositiveInfinity) {
        // https://en.wikipedia.org/wiki/Rounding#Round_half_up
        return Math.floor(value + 0.5)
    }

    return value < 0 ? -tmp : tmp
}

export const round = (
    value: number,
    precision: number,
    mode: (typeof RoundMode)[keyof typeof RoundMode] = RoundMode.ToPositiveInfinity
) => {
    if (isNaN(value) || !isFinite(value) || Math.trunc(value) === value) {
        return value
    }

    precision = precision > 15 ? 15 : precision < 0 ? 0 : precision
    const p = Math.pow(10, precision)

    // Do pre-rounding (like in PHP)
    // https://wiki.php.net/rfc/rounding#pre-rounding_to_the_value_s_precision_if_possible
    const preRoundPrecision = 14 - Math.floor(Math.log10(value))
    if (preRoundPrecision > precision && preRoundPrecision - 15 < precision) {
        value = roundToInt(value * Math.pow(10, preRoundPrecision), mode)
        value /= Math.pow(10, Math.abs(precision - preRoundPrecision))
    } else {
        value *= p
    }

    return roundToInt(value, mode) / p
}
