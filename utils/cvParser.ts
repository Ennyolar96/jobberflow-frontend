export interface ParsedCV {
  name: string;
  skills: string[];
  experience: string[];
  summary: string;
}

export const cvParser = {
  parseFromText: (text: string): ParsedCV => {
    // Simple heuristic parser for now. In a real app, use an LLM for structured extraction.
    const skills = text.match(/skills:(.*?)(?=\n|$)/gi)?.[0]?.replace(/skills:/gi, '').split(',') || ["General Tech"];
    const experience = text.match(/experience:(.*?)(?=\n|$)/gi)?.[0]?.replace(/experience:/gi, '').split(',') || ["Developer"];
    
    return {
      name: "Candidate",
      skills: skills.map(s => s.trim()),
      experience: experience.map(e => e.trim()),
      summary: text.slice(0, 100),
    };
  }
};
