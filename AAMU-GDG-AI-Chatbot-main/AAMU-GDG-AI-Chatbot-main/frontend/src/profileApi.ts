const PROFILE_STORAGE_KEY = 'aamu-advising-profile';

export interface UserProfile {
  firstName: string;
  lastName: string;
  classification: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | '';
  coursesTaken: string[];
  major: string;
  degreeWorksPdfName?: string;
  expectedGraduation?: string;
  academicStanding?: string;
  email?: string;
  photoURL?: string;
}

export const profileApi = {
  async saveProfile(profile: UserProfile): Promise<void> {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  },

  async getProfile(): Promise<UserProfile | null> {
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!savedProfile) return null;

    try {
      return JSON.parse(savedProfile) as UserProfile;
    } catch {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      return null;
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const currentProfile = await this.getProfile();
    if (!currentProfile) {
      throw new Error('Create a profile before updating it.');
    }

    await this.saveProfile({ ...currentProfile, ...updates });
  },

  async uploadDegreeWorks(file: File): Promise<{ name: string }> {
    if (file.type !== 'application/pdf') {
      throw new Error('Please select a PDF file.');
    }

    return { name: file.name };
  },
};
