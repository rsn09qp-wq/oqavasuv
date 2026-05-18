/**
 * Standardizes name comparison by removing spelling variations 
 * common in Uzbek Cyrillic/Latin transliteration.
 */
export function normalizeName(name) {
    if (!name) return "";
    
    return name.toString()
        .toUpperCase()
        // Replace common interchangeable characters BEFORE removing special chars
        .replace(/O'/g, 'A')
        .replace(/G'/g, 'G')
        // Remove spaces and non-alphanumeric characters
        .replace(/[^A-Z0-9]/g, '')
        .replace(/O/g, 'A')
        .replace(/Y/g, 'I')
        .replace(/U/g, 'I')
        .replace(/X/g, 'H')
        .replace(/CH/g, 'C')
        .replace(/SH/g, 'S')
        .trim();
}

/**
 * Checks if two names should be considered the same person.
 */
export function isSamePerson(name1, name2) {
    if (!name1 || !name2) return false;
    return normalizeName(name1) === normalizeName(name2);
}
