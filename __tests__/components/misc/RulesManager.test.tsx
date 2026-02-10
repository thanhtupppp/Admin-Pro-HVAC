
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RulesManager from '../../../components/RulesManager';
import { rulesService } from '../../../services/rulesService';

jest.mock('../../../services/rulesService');

describe('RulesManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (rulesService.getRules as jest.Mock).mockResolvedValue([
            { id: 'r1', name: 'Rule 1', description: 'Desc 1', status: 'active', conditions: [], actions: [] }
        ]);
        (rulesService.updateRule as jest.Mock).mockResolvedValue(undefined);
    });

    it('should render rules', async () => {
        render(<RulesManager />);
        await waitFor(() => {
            expect(screen.getByText('Rule 1')).toBeInTheDocument();
        });
    });
});
