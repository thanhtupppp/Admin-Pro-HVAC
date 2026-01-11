import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class SuperheatSubcoolCalculator extends StatefulWidget {
  const SuperheatSubcoolCalculator({super.key});

  @override
  State<SuperheatSubcoolCalculator> createState() =>
      _SuperheatSubcoolCalculatorState();
}

class _SuperheatSubcoolCalculatorState extends State<SuperheatSubcoolCalculator>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text(
          'Superheat & Subcool',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.blueAccent,
          unselectedLabelColor: Colors.grey,
          indicatorColor: Colors.blueAccent,
          tabs: const [
            Tab(text: 'Superheat (Hút)'),
            Tab(text: 'Subcool (Lỏng)'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          CalculatorView(mode: CalculatorMode.superheat),
          CalculatorView(mode: CalculatorMode.subcool),
        ],
      ),
    );
  }
}

enum CalculatorMode { superheat, subcool }

class CalculatorView extends StatefulWidget {
  final CalculatorMode mode;
  const CalculatorView({super.key, required this.mode});

  @override
  State<CalculatorView> createState() => _CalculatorViewState();
}

class _CalculatorViewState extends State<CalculatorView> {
  String selectedGas = 'R32';
  final TextEditingController _pressureController = TextEditingController();
  final TextEditingController _tempController = TextEditingController();

  bool isPsi = true;
  double? resultValue;
  String? diagnosis;

  final List<String> gases = ['R22', 'R32', 'R410A', 'R134a'];

  @override
  Widget build(BuildContext context) {
    final isSH = widget.mode == CalculatorMode.superheat;
    final color = isSH ? Colors.blueAccent : Colors.redAccent;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Inputs
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildDropdown(
                    label: 'Loại Gas',
                    value: selectedGas,
                    items: gases,
                    onChanged: (val) {
                      setState(() {
                        selectedGas = val!;
                        _calculate();
                      });
                    },
                  ),
                  const Gap(16),
                  Row(
                    children: [
                      Expanded(
                        child: _buildInput(
                          controller: _pressureController,
                          label: isSH
                              ? 'Áp suất Hút (Low)'
                              : 'Áp suất Đẩy (High)',
                          suffix: isPsi ? 'PSI' : 'Bar',
                          onChanged: (_) => _calculate(),
                        ),
                      ),
                      const Gap(8),
                      IconButton(
                        onPressed: () {
                          setState(() {
                            isPsi = !isPsi;
                            _calculate();
                          });
                        },
                        icon: Icon(Icons.swap_horiz, color: color),
                        tooltip: 'Đổi đơn vị PSI/Bar',
                      ),
                    ],
                  ),
                  const Gap(16),
                  _buildInput(
                    controller: _tempController,
                    label: isSH
                        ? 'Nhiệt độ Ống Hút (Thực tế)'
                        : 'Nhiệt độ Ống Lỏng (Thực tế)',
                    suffix: '°C',
                    onChanged: (_) => _calculate(),
                  ),
                ],
              ),
            ),
          ),
          const Gap(24),

          // 2. Result
          if (resultValue != null)
            Container(
              padding: const EdgeInsets.all(20),
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: color.withValues(alpha: 0.5)),
                boxShadow: [
                  BoxShadow(
                    color: color.withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    isSH ? 'SUPERHEAT' : 'SUBCOOL',
                    style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const Gap(8),
                  Text(
                    '${resultValue!.toStringAsFixed(1)} °C',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Gap(16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: _getDiagnosisColor(
                        resultValue!,
                        isSH,
                      ).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      diagnosis ?? '',
                      style: TextStyle(
                        color: _getDiagnosisColor(resultValue!, isSH),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const Gap(24),
          // 3. Info
          const Text(
            'Khoảng tiêu chuẩn:',
            style: TextStyle(color: Colors.grey, fontSize: 14),
          ),
          const Gap(8),
          _buildInfoRow(
            'Superheat',
            '6 - 12 °C (Máy không Inverter/Capillary)',
          ),
          const Gap(4),
          _buildInfoRow('Subcool', '5 - 10 °C (Tốt nhất cho TXV)'),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required Function(String?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        const Gap(8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              dropdownColor: const Color(0xFF1E293B),
              style: const TextStyle(color: Colors.white),
              items: items
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInput({
    required TextEditingController controller,
    required String label,
    required String suffix,
    required Function(String) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        const Gap(8),
        TextField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: const TextStyle(color: Colors.white, fontSize: 18),
          onChanged: onChanged,
          decoration: InputDecoration(
            hintText: '0.0',
            hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
            suffixText: suffix,
            suffixStyle: const TextStyle(color: Colors.blueAccent),
            filled: true,
            fillColor: const Color(0xFF0F172A),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      children: [
        const Icon(Icons.check_circle_outline, color: Colors.green, size: 16),
        const Gap(8),
        Text(
          '$label: ',
          style: const TextStyle(
            color: Colors.white70,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(value, style: const TextStyle(color: Colors.white70)),
      ],
    );
  }

  Color _getDiagnosisColor(double val, bool isSH) {
    final low = isSH ? 6.0 : 5.0;
    final high = isSH ? 12.0 : 10.0;
    if (val < low) return Colors.blue; // Too low (Floodback risk / Empty)
    if (val > high) return Colors.orange; // Too high (Starved / High Head)
    return Colors.green; // OK
  }

  void _calculate() {
    if (_pressureController.text.isEmpty || _tempController.text.isEmpty) {
      setState(() => resultValue = null);
      return;
    }

    try {
      double p = double.parse(_pressureController.text.replaceAll(',', '.'));
      double t = double.parse(_tempController.text.replaceAll(',', '.'));

      double pBarAbs;
      if (isPsi) {
        // P_abs = P_gauge + 14.7 (approx atmospheric pressure in PSI)
        // 1 PSI = 0.0689476 Bar
        pBarAbs = (p + 14.7) * 0.0689476;
      } else {
        // Bar Gauge -> Bar Abs (approx atmospheric pressure in Bar)
        pBarAbs = p + 1.013;
      }

      double tSat = _getSaturationTemp(selectedGas, pBarAbs);

      double delta;
      String diag = '';

      if (widget.mode == CalculatorMode.superheat) {
        // SH = T_suction - T_sat
        delta = t - tSat;
        if (delta < 6) {
          diag = 'Thấp ❄️ (Nguy cơ lỏng về máy nén / Dư gas)';
        } else if (delta > 12) {
          diag = 'Cao 🔥 (Thiếu gas / Nghẹt tiết lưu)';
        } else {
          diag = 'Chuẩn ✅';
        }
      } else {
        // SC = T_sat - T_liquid
        delta = tSat - t;
        if (delta < 5) {
          diag = 'Thấp (Thiếu gas / Giải nhiệt kém)';
        } else if (delta > 10) {
          diag = 'Cao (Dư gas / Nghẹt dàn)';
        } else {
          diag = 'Chuẩn ✅';
        }
      }

      setState(() {
        resultValue = delta;
        diagnosis = diag;
      });
    } catch (e) {
      // invalid input
    }
  }

  // Simple Antoine or Approximation
  // R22, R410A, R32, R134a
  // Simplified Log-Linear fit for operating range (0 - 50 Bar)
  double _getSaturationTemp(String gas, double pBarAbs) {
    return _interpolatePT(gas, pBarAbs);
  }

  double _interpolatePT(String gas, double pBarAbs) {
    // Basic Table (Bar Abs, Temp C)
    // Source: Standard PT Charts
    // R22
    final r22 = [
      [1.0, -40.8],
      [2.0, -25.0],
      [3.0, -15.0],
      [4.0, -7.0],
      [5.0, 0.5],
      [6.0, 7.0],
      [7.0, 12.5],
      [8.0, 17.5],
      [10.0, 26.0],
      [12.0, 33.0],
      [15.0, 42.0],
      [18.0, 49.0],
      [20.0, 53.0],
      [25.0, 62.0],
    ];
    // R410A
    final r410a = [
      [1.0, -51.4],
      [3.0, -29.0],
      [5.0, -17.0],
      [7.0, -9.0],
      [8.0, -5.0],
      [10.0, 0.5],
      [12.0, 6.0],
      [15.0, 13.5],
      [20.0, 24.0],
      [25.0, 33.0],
      [30.0, 40.0],
      [35.0, 47.0],
      [40.0, 53.0],
    ];
    // R32
    final r32 = [
      [1.0, -51.7],
      [3.0, -29.5],
      [5.0, -17.5],
      [7.0, -9.5],
      [10.0, 0.0],
      [12.0, 5.5],
      [15.0, 13.0],
      [20.0, 23.5],
      [25.0, 32.5],
      [30.0, 39.5],
      [35.0, 46.5],
      [40.0, 52.5],
    ];
    // R134a
    final r134a = [
      [1.0, -26.1],
      [2.0, -10.0],
      [3.0, 0.5],
      [4.0, 9.0],
      [5.0, 15.5],
      [7.0, 26.5],
      [10.0, 39.5],
      [15.0, 55.5],
      [20.0, 67.5],
    ];

    List<List<double>> table = [];
    if (gas == 'R22') table = r22;
    if (gas == 'R410A') table = r410a;
    if (gas == 'R32') table = r32;
    if (gas == 'R134a') table = r134a;

    if (table.isEmpty) return 0.0;

    // Interpolation
    for (int i = 0; i < table.length - 1; i++) {
      if (pBarAbs >= table[i][0] && pBarAbs <= table[i + 1][0]) {
        double p1 = table[i][0];
        double t1 = table[i][1];
        double p2 = table[i + 1][0];
        double t2 = table[i + 1][1];
        // Linear: T = T1 + (P - P1)*(T2 - T1)/(P2 - P1)
        return t1 + (pBarAbs - p1) * (t2 - t1) / (p2 - p1);
      }
    }
    // Out of range? Extrapolate or clamp.
    if (pBarAbs < table.first[0]) return table.first[1];
    if (pBarAbs > table.last[0]) return table.last[1];

    return 0.0;
  }
}
