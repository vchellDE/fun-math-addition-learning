import { describe, it, expect } from 'vitest';
import { parseSpokenNumber, parseSpokenAlternatives } from '../../src/lib/speechParser';

describe('parseSpokenNumber', () => {
  // Single digits
  it.each([
    ['one', 1],
    ['two', 2],
    ['three', 3],
    ['four', 4],
    ['five', 5],
    ['six', 6],
    ['seven', 7],
    ['eight', 8],
    ['nine', 9],
  ])('parses "%s" → %i', (word, expected) => {
    const result = parseSpokenNumber(word);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(expected);
  });

  // Teens
  it.each([
    ['ten', 10],
    ['eleven', 11],
    ['twelve', 12],
    ['thirteen', 13],
    ['fourteen', 14],
    ['fifteen', 15],
    ['sixteen', 16],
    ['seventeen', 17],
    ['eighteen', 18],
    ['nineteen', 19],
  ])('parses teen "%s" → %i', (word, expected) => {
    const result = parseSpokenNumber(word);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(expected);
  });

  // Tens alone
  it.each([
    ['twenty', 20],
    ['thirty', 30],
    ['forty', 40],
    ['fifty', 50],
    ['sixty', 60],
    ['seventy', 70],
    ['eighty', 80],
    ['ninety', 90],
  ])('parses tens "%s" → %i', (word, expected) => {
    const result = parseSpokenNumber(word);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(expected);
  });

  // Compounds
  it.each([
    ['twenty one', 21],
    ['twenty-one', 21],
    ['thirty four', 34],
    ['ninety nine', 99],
  ])('parses compound "%s" → %i', (phrase, expected) => {
    const result = parseSpokenNumber(phrase);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(expected);
  });

  // Digit strings
  it.each([
    ['7', 7],
    ['12', 12],
    ['34', 34],
    ['99', 99],
    ['0', 0],
  ])('parses digit "%s" → %i', (digits, expected) => {
    const result = parseSpokenNumber(digits);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(expected);
  });

  // Filler phrases
  it.each([
    ['um seven', 7],
    ['the answer is twelve', 12],
    ['oh seven', 7],
  ])('parses with filler "%s" → %i', (phrase, expected) => {
    const result = parseSpokenNumber(phrase);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(expected);
  });

  // Failures
  it('returns no-number for empty', () => {
    const result = parseSpokenNumber('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no-number');
  });

  it('returns no-number for hello', () => {
    const result = parseSpokenNumber('hello');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no-number');
  });

  it('returns ambiguous for one two', () => {
    const result = parseSpokenNumber('one two');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('ambiguous');
  });

  it('returns out-of-range for one hundred', () => {
    const result = parseSpokenNumber('one hundred');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('out-of-range');
  });

  it('returns out-of-range for digit 100', () => {
    const result = parseSpokenNumber('100');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('out-of-range');
  });

  // Homophones (v4)
  it.each([
    ['fitty', 50],
    ['fiddy', 50],
    ['fiveteen', 15],
    ['forteen', 14],
    ['thirtee', 13],
  ])('parses homophone "%s" → %i', (word, expected) => {
    const result = parseSpokenNumber(word);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(expected);
  });

  // Mid-phrase fillers (v4)
  it.each([
    ['seven um', 7],
    ["it's seven", 7],
    ['like five', 5],
  ])('parses mid-phrase filler "%s" → %i', (phrase, expected) => {
    const result = parseSpokenNumber(phrase);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(expected);
  });

  // expectedMax tie-breaking within transcript
  it('uses expectedMax to disambiguate fifteen vs fifty', () => {
    const result = parseSpokenNumber('fifteen fifty', { expectedMax: 17 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(15);
  });

  it('returns ambiguous when expectedMax cannot break tie', () => {
    const result = parseSpokenNumber('fifteen fifty', { expectedMax: 99 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('ambiguous');
  });

  // Alternative tie-breaking across STT alternatives
  it('parseSpokenAlternatives picks value within expectedMax', () => {
    const result = parseSpokenAlternatives(['fifty', 'fifteen'], { expectedMax: 17 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(15);
  });

  it('parseSpokenAlternatives uses first ok when values agree', () => {
    const result = parseSpokenAlternatives(['two', 'to'], { expectedMax: 2 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(2);
  });
});
