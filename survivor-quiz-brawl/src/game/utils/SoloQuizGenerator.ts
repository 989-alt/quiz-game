
import type { Quiz } from '../../types/quiz';

export class SoloQuizGenerator {
    static generateMathQuiz(grade: number): Partial<Quiz> {
        switch (grade) {
            case 1: // Add/Sub 1-digit
                return this.generateBasicMath(1, 9, ['+', '-']);
            case 2: // Add/Sub 2-digit, Basic Mult
                return Math.random() < 0.7
                    ? this.generateBasicMath(10, 99, ['+', '-'])
                    : this.generateBasicMath(2, 9, ['*']);
            case 3: // Mult/Div, 3-digit Add
                return Math.random() < 0.5
                    ? this.generateBasicMath(2, 12, ['*', '/'])
                    : this.generateBasicMath(100, 999, ['+']);
            case 4: // Mixed operations, larger numbers
                return this.generateMixedMath(10, 100);
            case 5: // Simple Fractions/Decimals (Simulated), comparisons
                return this.generateComparison(grade);
            case 6: // Complex logic/geometry hints
                return this.generateLogicMath();
            default:
                return this.generateBasicMath(1, 10, ['+']);
        }
    }

    private static generateBasicMath(min: number, max: number, ops: string[]): Partial<Quiz> {
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a = Math.floor(Math.random() * (max - min + 1)) + min;
        let b = Math.floor(Math.random() * (max - min + 1)) + min;
        let answer = 0;

        // Ensure positive/clean results
        if (op === '-') {
            if (a < b) [a, b] = [b, a];
            answer = a - b;
        } else if (op === '/') {
            answer = a; // Make 'a' the answer
            a = answer * b; // Adjust 'a' so a/b = answer (integer)
        } else if (op === '*') {
            answer = a * b;
        } else {
            answer = a + b;
        }

        const question = `${a} ${op.replace('*', '×').replace('/', '÷')} ${b} = ?`;
        return this.createChoices(question, answer);
    }

    private static generateMixedMath(min: number, max: number): Partial<Quiz> {
        const start = Math.floor(Math.random() * (max - min + 1)) + min;
        const add = Math.floor(Math.random() * 50) + 1;
        const sub = Math.floor(Math.random() * 30) + 1;
        const answer = start + add - sub;

        const question = `${start} + ${add} - ${sub} = ?`;
        return this.createChoices(question, answer);
    }

    private static generateComparison(grade: number): Partial<Quiz> {
        // 5th grade: Compare decimals
        const a = parseFloat((Math.random() * 10).toFixed(1));
        const b = parseFloat((Math.random() * 10).toFixed(1));

        if (a === b) return this.generateComparison(grade); // Retry if equal

        const question = `다음 중 더 큰 수는? (${a} vs ${b})`;
        const answer = Math.max(a, b);
        const wrong = Math.min(a, b);

        return {
            question,
            choices: [answer.toString(), wrong.toString(), "같다", "알 수 없다"],
            correctIndex: 0
        };
    }

    private static generateLogicMath(): Partial<Quiz> {
        // 6th grade logical pattern
        const start = Math.floor(Math.random() * 5) + 1;
        const step = Math.floor(Math.random() * 4) + 2;
        // Pattern: start, start+step, start+2*step, ?
        const answer = start + 3 * step;
        const seq = [start, start + step, start + 2 * step];

        const question = `다음 수열의 빈칸에 들어갈 수는?\n${seq.join(', ')}, ( ? )`;
        return this.createChoices(question, answer);
    }

    private static createChoices(question: string, correctAnswer: number): Partial<Quiz> {
        // Generate 3 wrong answers close to the correct one
        const wrongAnswers = new Set<number>();
        while (wrongAnswers.size < 3) {
            const offset = Math.floor(Math.random() * 10) - 5; // -5 to +4
            const wrong = correctAnswer + offset;
            if (wrong !== correctAnswer && wrong >= 0) {
                wrongAnswers.add(wrong);
            }
        }

        const choices = [correctAnswer, ...Array.from(wrongAnswers)].map(String);
        // Shuffle choices
        const correctIndex = Math.floor(Math.random() * 4);
        [choices[0], choices[correctIndex]] = [choices[correctIndex], choices[0]];

        return {
            question,
            options: choices,
            correctIndex,
            difficulty: 'medium'
        };
    }
}
